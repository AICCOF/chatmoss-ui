<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NCard, NInput, NModal, NSelect, useDialog, useMessage } from 'naive-ui'
import { showConfirmDialog } from 'vant'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import Guide from './guide.vue'
import applicationList from './applicationList.vue'
import Footer from './layout/footerNew/index.vue'
import { getLatestCharReduceInfo } from './../../api/weixin'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStoreWithout, useChatStore, useUserStore, verify } from '@/store'
import { auth, fetchChatAPIProcess, paper } from '@/api'
import Paper from '@/views/paper/index.vue'
import { t } from '@/locales'
import selectOption from '@/assets/chatmossGroup.json'
import vsCodeUtils from '@/utils/vsCodeUtils'
import { localStorage } from '@/utils/storage/localStorage'
import { getToken } from '@/store/modules/auth/helper'
import { useGo } from '@/utils/router'

const authStore = useAuthStoreWithout()
const go = useGo()

const userStore = useUserStore()
const showPaper = ref(false)
const appStore = useAppStore()

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const NInputRef = ref<HTMLInputElement | null>(null)
const NSelectRef = ref<HTMLInputElement | null>(null)

if (!localStorage.getItem('chatMossPiecesNumber'))
  localStorage.setItem('chatMossPiecesNumber', '30')

// 主题
if (!localStorage.getItem('chatmossTheme'))
  localStorage.setItem('chatmossTheme', 'dark')
appStore.setTheme(localStorage.getItem('chatmossTheme') as any)

// 专业模式初始化
if (!localStorage.getItem('chatmossMode'))
  localStorage.setItem('chatmossMode', 'normal')

// 字体初始化
if (!localStorage.getItem('fontSizeNum')) {
  localStorage.setItem('fontSizeNum', '100%')
}
else {
  const fontSizeNumNew: any = localStorage.getItem('fontSizeNum')
  localStorage.setItem('fontSizeNum', fontSizeNumNew.endsWith('%') ? fontSizeNumNew : `${fontSizeNumNew < 50 ? 50 : fontSizeNumNew}%`)
  const htmlDom = document.querySelector('html') as any
  htmlDom.style.zoom = localStorage.getItem('fontSizeNum')
}

if (!localStorage.getItem('isCorrelation'))
  localStorage.setItem('isCorrelation', 'true')

let controller = new AbortController()

const ms = useMessage()

const chatStore = useChatStore()
useCopyCode()
const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex }
  = useChat()
const { scrollRef, scrollToBottom, goToBottom } = useScroll()

const dataSources = computed(() => chatStore.getChatByUuid())
const conversationList = computed(() =>
  dataSources.value.filter(item => !item.inversion && !item.error),
)

const userInputindex = ref<number>(0)
userStore.getOpenaiList()

const userInputList = computed(() => {
  const list = dataSources.value.filter((item) => {
    return !('loading' in item)
  })
  currentIndex.value = list.length
  return list
})
const currentIndex = computed({
  get: () => {
    if (userInputindex.value > userInputList.value.length)
      return userInputList.value.length

    else if (userInputindex.value < 0)
      return 0

    else
      return userInputindex.value
  },
  set: (val) => {
    userInputindex.value = val
  },
})
watch(() => chatStore.getChatByUuid(), (...vals) => {
  setTimeout(() => {
    goToBottom()
  }, 300)
})

function handleSubmit() {
  userStore.residueCountAPI()
  onConversation()
}

// 检测是否输出英文
const engList = [
  'Hello! How can I assist you today?',
  'Hello! how can I assist you today?',
  'Hello! How may I assist you today?',
  'Hello! I\'m happy to help. How can I assist you today?',
  'Hello! I\'m happy to help. What can I assist you with today?',
  'Hello! I\'m ready to help. What\'s your question?',
  'Sure, I\'m here to help. How can I assist you today?',
  'How can I help you today?',
]

// 计算消耗的字符数量
function addTextNum(num: any) {
  // console.log('num', num)
  let chatMossTextNum = localStorage.getItem('chatMossTextNum')
  if (!chatMossTextNum)
    chatMossTextNum = '0'
  localStorage.setItem('chatMossTextNum', num + Number(chatMossTextNum))
}

const dialog = useDialog()
async function ConfirmNotice(msg: string) {
  return new Promise((resole, reject) => {
    dialog.warning({
      title: '警告',
      content: msg,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        resole(true)
      },
      onNegativeClick: () => {
        reject(false)
      },
    })
  })
}

let chatOptions: Record<string, any> = {
  conversationId: chatStore.getUuid,
  openaiVersion: userStore.getOpenaiVersion,
}
function askFn(askMsg: string) {
  onConversation(askMsg, {})
}
function onlineFn(askMsg: string) {
  // console.log(askMsg, 1)

  onConversation(askMsg, { online: 1 })
}
function jarvisFn(askMsg: string) {
  onConversation(askMsg, { jarvis: 1 })
}
async function onConversation(askMsg?: string, opt?) {
  if (userStore.residueCount < 200000 && userStore.isHighVersion && userStore.isHighVersionMsg) {
    ms.error('4.0模型消耗大量字符，需20万字符才可使用。请去ChatMoss商店补充字符数或购买包月模式，或者切换至3.5模型')
    return
  }
  // if (localStorage.getItem('apiKey') && userStore.isHighVersion && userStore.isHighVersionMsg) {
  //   ms.error('请先去设置中心移除key再使用4.0进行提问')
  //   return
  // }

  if (chatStore.isLimit && userStore.isHighVersion && userStore.isHighVersionMsg) {
    const res = await ConfirmNotice('当前问题字符数过高，请斟酌是否继续使用4.0')
    if (!res)
      return
  }
  chatStore.clearQuestionMode()

  if (opt) {
    chatOptions = {
      conversationId: chatStore.getUuid,
      openaiVersion: userStore.getOpenaiVersion,
      appId: userStore.appIdValue,
      ...opt,
    }
  }
  else {
    chatOptions = {
      conversationId: chatStore.getUuid,
      appId: userStore.appIdValue,
      openaiVersion: userStore.getOpenaiVersion,
    }
  }

  const message = prompt.value || askMsg

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  await addChat(chatStore.getUuid, {
    timestamp: new Date().getTime(),
    createTime: new Date().toLocaleString(),
    text: message,
    inversion: true,
    error: false,
    ast: '',
    conversationOptions: null,
    requestOptions: { prompt: message, options: null },
  })
  goToBottom()
  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext
    = conversationList.value[conversationList.value.length - 1]
      ?.conversationOptions

  if (lastContext)
    options = { ...lastContext }

  await addChat(chatStore.getUuid, {
    timestamp: new Date().getTime(),
    createTime: new Date().toLocaleString(),
    text: '',
    loading: true,
    inversion: false,
    error: false,
    ast: message,
    conversationOptions: { conversationId: chatStore.getUuid },
    requestOptions: { prompt: message, options: { ...options } },
  })
  scrollToBottom()

  try {
    const chatMossPiecesNumber = Number(localStorage.getItem('chatMossPiecesNumber')) + 2
    console.log('chatMossPiecesNumber', chatMossPiecesNumber)
    // 在这里拼接用户所有的上下文
    let texts = message
    const token = getToken()
    if (!token && verify(chatStore.getUuid))
      texts = dataSources.value.slice(-chatMossPiecesNumber).map(item => item.text).join('\n')

    if (localStorage.getItem('chatmossMode') === 'speciality')
      texts = `${texts} 请详细回答`

    // texts = compressCode(texts)

    const data = await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: texts,
      options: {
        ...options,
        ...chatOptions,
      },
      apiKey: userStore.useKey === '1' ? localStorage.getItem('apiKey') : '',
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        // const { responseText } = xhr
        const chunk = xhr.responseText
        // console.log(unescape(xhr.responseText))
        try {
          // const data = JSON.parse(chunk)
          updateChat(chatStore.getUuid, dataSources.value.length - 1, {
            timestamp: new Date().getTime(),
            createTime: new Date().toLocaleString(),
            text: chunk ?? '',
            inversion: false,
            ast: message,
            error: false,
            loading: false,
            conversationOptions: {
              conversationId: chatStore.getUuid,
            },
            requestOptions: { prompt: message, options: { ...options } },
          })
          scrollToBottom()
        }
        catch (error) {
          //
        }
      },
    })

    // 超出token提示
    const tip1 = data as any as string
    if (engList.includes(tip1))
      ms.error('系统检测到当前可能正在输出异常英文，这个原因是OpenAI最大token限制是4090，当前对话可能已超过最大字符限制，请您新建问题，并精简问题，继续对话~ChatMoss无限上下文模式正在攻关中，敬请期待，感谢您的理解~')

    addTextNum(texts.length)
    scrollToBottom()
  }
  catch (error: any) {
    // ms.error(error.msg || error.message)

    if (error.code === 10000) {
      showConfirmDialog({
        title: '切换模型',
        message: '您当前问题已经超过模型最大4k字符上下文，是否切换到16k上下文模型?',
        confirmButtonText: '切换',
        cancelButtonText: '不切换',
      }).then(() => {
        // on close
        userStore.toggleOpenaiVersion()
      })
    }
    else if (error.code === 10001) {
      if (getToken()) {
        showConfirmDialog({
          title: 'key失效',
          message: '您当前设置的key不正确，或者key已经到期，目前ChatMoss 3.5 可免费使用，是否取消使用自己的key?',
          confirmButtonText: '确定',
          cancelButtonText: '知道了',
        }).then(() => {
          // on close
          userStore.closeKey()
        })
      }
      else {
        showConfirmDialog({
          title: 'key失效',
          message: '您当前设置的key不正确，或者key已经到期，目前ChatMoss 3.5登录后可免费使用，是否登录？',
          confirmButtonText: '去登录',
          cancelButtonText: '知道了',
        }).then(() => {
          // on close
          userStore.closeKey()
          go({
            name: 'login',
          })
        })
      }
    }
    if (error.code === 204) {
      // error.msg
      ms.error(error.msg)
    }
    // 答应其他信息
    const errorMessage = error.msg
    if (error.message === 'canceled') {
      updateChatSome(chatStore.getUuid, dataSources.value.length - 1, {
        loading: false,
      })
      scrollToBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(
      chatStore.getUuid,
      dataSources.value.length - 1,
    )

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(chatStore.getUuid, dataSources.value.length - 1, {
        text: `${errorMessage}`,
        error: true,
        loading: false,
      })
      return
    }

    // updateChat(chatStore.getUuid, dataSources.value.length - 1, {
    //   timestamp: new Date().getTime(),
    //   createTime: new Date().toLocaleString(),
    //   text: errorMessage,
    //   inversion: false,
    //   ast: message,
    //   error: true,
    //   loading: false,
    //   conversationOptions: null,
    //   requestOptions: { prompt: message, options: { ...options } },
    // })
    scrollToBottom()
  }
  finally {
    getLatestCharReduceInfo({
      conversationId: chatStore.getUuid,
    }).then((res) => {
      updateChatSome(chatStore.getUuid, dataSources.value.length - 1, {
        mossReduceInfo: res.data,
      })
    })

    loading.value = false
    userStore.residueCountAPI()
  }
}

const handleSelectInput = (event: any) => {
  prompt.value = event.data
  setTimeout(() => {
    NInputRef.value?.focus()
  }, 200)
}

function handleEnter(event: KeyboardEvent) {
  // 如果输入的是/,并且按下的键是删除键，同时prompt.value的值只有/则把prompt.value的值置空
  if (event.key === 'Backspace' && prompt.value === '/')
    prompt.value = ''

  // 输入 prompt / 重新获取焦点 第一次 / prompt.value时空字符
  if (event.key === '/' && !prompt.value) {
    setTimeout(() => {
      NSelectRef.value?.focus()
    }, 200)
  }
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
  else if (userInputList.value.length && (!prompt.value || prompt.value[0] !== '/')) {
    if (event.key === 'ArrowUp' && event.ctrlKey) {
      currentIndex.value -= 1
      prompt.value = userInputList.value[currentIndex.value].text
    }
    else if (event.key === 'ArrowDown' && event.ctrlKey) {
      currentIndex.value += 1
      prompt.value = userInputList.value[currentIndex.value]?.text
    }
    else {
      currentIndex.value = userInputList.value.length
    }
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  if (localStorage.getItem('apiKey'))
    return false
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const wrapClass = computed(() => {
  // if (isMobile.value)
  //   return ['pt-14']
  return []
})

const footerClass = computed(() => {
  // let classes = ['p-4', 'pt-0']
  const classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'pt-0']
  return classes
})

// 初始化与vscode通信
vsCodeUtils({
  handleVscodeMessage(selectedText: string) {
    const questionListDom = document.querySelector('.question-list') as HTMLDivElement
    const questionBtnDom = document.querySelector('#question-btn') as HTMLDivElement
    if (questionListDom === null || questionListDom.innerText !== '新建问题') {
      questionBtnDom.click()
      console.log('新建问题')
      clickMessage()
    }
    else {
      prompt.value = selectedText
      console.log('回答问题')
      clickMessage()
    }
  },
  handleToken: (value: string) => {
    // console.log(value)
    authStore.setToken(value)
    userStore.residueCountAPI()
  },
})
function clickMessage() {
  const selectedText = localStorage.getItem('selectedText')
  console.log('??', selectedText)
  if (selectedText) {
    prompt.value = selectedText
    localStorage.setItem('selectedText', '')
    setTimeout(() => {
      const dom = document.querySelector('#ask-question') as any
      // console.log(dom)
      dom && dom.click()
    }, 1500)
  }
}

onMounted(() => {
  clickMessage()
  chatStore.chatList()
  userStore.getActivityListAPI()
  userStore.residueCountAPI()
  userStore.getBalanceInfo()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

const paperList = ref<Chat.paper[]>([])
const nowPaperIndex = ref<number>(0)
async function startTutorial() {
  nowPaperIndex.value = 0
  if (paperList.value.length)
    return showPaper.value = true

  try {
    const { data } = await paper<Chat.paper[]>()
    paperList.value = data
    showPaper.value = true
  }
  catch (error: any) {
    if (error.code === 204) {
      // error.msg
      ms.error('请登录后再开始进行通关认证')
      return
    }
    ms.error(error.msg || error.message)
  }
}

async function onSuccessAuth() {
  try {
    await auth()
    ms.success('恭喜您完成了ChatMoss的初级认证，200000字符额度已下发到您的账户，愿AI为您的工作带来帮助，感谢您的使用和支持~，3秒后自动关闭弹窗')
  }
  catch (error: any) {
    ms.error(error.msg || error.message)
  }
  finally {
    setTimeout(() => {
      showPaper.value = false
    }, 3000)
  }
}
function handleMode() {
  userStore.toggleMode()
}
</script>

<template>
  <div class="flex flex-col w-full h-full" :class="wrapClass">
    <main class="flex flex-1 overflow-hidden">
      <transition name="fade">
        <applicationList
          v-show="userStore.isAuth === 2 && userStore.toggleValue" class="transition"
          :style="{ width: userStore.toggleValue ? '71px' : '1px' }"
        />
      </transition>
      <div
        id="scrollRef" class="h-full overflow-hidden overflow-y-auto chat-main"
        :class="[userStore.toggleValue ? 'p90' : '']"
      >
        <div
          id="image-wrapper" class="w-full m-auto flex items-center py-4" :class="[isMobile ? 'px-2' : 'px-4']"
          style="height: 100%;overflow: hidden"
        >
          <template v-if="!dataSources.length">
            <div class="no-data-info  w-full">
              <!-- 应用介绍 -->
              <div v-if="userStore.currentApp" class="no-data-info-text">
                应用使用说明：{{ userStore.currentApp.desc }}
              </div>
              <!-- 空态占位图 -->
              <!-- <img
                v-if="authStore.token && userStore.centerPicUrl" class="no-data-img" :src="userStore.centerPicUrl"
                alt="" @click="() => { go({ name: 'shop' }) }"
              > -->
              <div>
                <!-- 后面期望这里跳转使用教程页面 -->
                <div class="no-data-info-tip-title">
                  ChatMoss使用教程（推荐必看）：
                </div>
                <a href="https://h5.aihao123.cn/pages/app/study/index.html" target="_blank">
                  <img
                    style="cursor: pointer; border-radius: 10px;" width="320" height="240"
                    src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss_1.png" alt=""
                  >
                </a>
              </div>
            </div>
          </template>
          <template v-else>
            <div ref="scrollRef" style="width:100%;max-height:100%;overflow:auto">
              <div id="data-wrapper">
                <Message
                  v-for="(item, index) of dataSources" :key="index" :date-time="item.createTime" :text="item.text"
                  :is-show="(dataSources.length - 1 == index) && (userStore.currentApp && userStore.currentApp.system === 1)"
                  :ask-msg="item.ast" :inversion="item.inversion" :error="item.error" :loading="item.loading" :view-msg="item.mossReduceInfo?.viewMsg" :question-mode="item.mossReduceInfo?.questionMode" @ask="askFn"
                  @online="onlineFn" @jarvis="jarvisFn"
                />

                <div class="sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" type="warning" @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    正在响应
                  </NButton>
                </div>
              </div>
            </div>
          </template>
        </div>
        <footer :class="footerClass">
          <transition name="fade">
            <Footer />
          </transition>
          <div class="w-full m-auto p-2" style="padding-bottom: 0px;">
            <div class="moss-btns flex justify-between space-x-2 w-full">
              <NInput
                v-if="!prompt || prompt[0] !== '/'" ref="NInputRef" v-model:value="prompt" class="step1 input"
                autofocus type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" :placeholder="placeholder"
                @keydown="handleEnter"
              />
              <NSelect
                v-if="prompt && prompt[0] === '/'" ref="NSelectRef" v-model:value="prompt" filterable :show="true"
                :autofocus="true" :autosize="{ minRows: 3, maxRows: 3 }" placeholder="placeholder" :options="selectOption"
                label-field="key" @keydown="handleEnter" @input="handleSelectInput"
              />
              <!-- MOSS字数 -->
              <div class="btn-style btn-mode" @click="handleMode">
                {{ userStore.toggleValue ? '正常模式' : '极简模式' }}
              </div>
              <div class="btn-style ">
                <NButton id="ask-question" type="primary" :disabled="buttonDisabled" @click="handleSubmit">
                  <template #icon>
                    <span class="">
                      <SvgIcon icon="ri:send-plane-fill" />
                    </span>
                  </template>
                </NButton>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>

    <div v-if="!userStore.userInfo.user.authed" class="text-center">
      <!-- 通关ChatMoss使用教程，获得20w字符奖励 -->
      <span class="v-auth cursor-pointer" @click="startTutorial" />
    </div>

    <NModal v-model:show="showPaper" transform-origin="center">
      <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <Paper v-model:sort="nowPaperIndex" :paper-list="paperList" @success="onSuccessAuth" />
      </NCard>
    </NModal>
    <Guide />
  </div>
</template>

<style lang="less" scoped>
.chat-main {
  background-color: var(--moss-bg-content-color);
}

.p90 {
  padding-top: 90px;
}

.no-data-info {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .no-data-info-tip-title {
    font-size: 14px;
    color: #FF6666;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .no-data-info-tip-text {
    width: 340px;
    font-size: 14px;
    // color: #fff;
    line-height: 28px;
    margin-bottom: 10px;
  }

  .no-data-info-text {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: var(--moss-text-time-color);
    position: absolute;
    font-size: 12px;
    top: 30px;
  }

  .no-data-img {
    width: 360px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 10px;
    cursor: pointer;
  }

  .no-data-info-title {
    position: relative;
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 600;
    width: 100%;
    color: #6C7275;
    text-align: center;

    span {
      position: absolute;
      margin-left: 10px;
    }
  }

  .no-data-info-tip {
    font-size: 12px;
    line-height: 12px;
    font-weight: 600;
    width: 100%;
    color: #6C7275;
    text-align: center;
    margin-top: 14px;
    margin-bottom: -14px;
  }

  .no-data-btns-list {
    width: 80%;
    max-width: 520px;
    height: auto;
    margin: 0 auto;
    margin-top: 40px;

    .no-data-btns-item {
      width: 100%;
      padding: 20px 20px;
      height: auto;
      border: 1px solid #343839;
      border-radius: 6px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .btns-item-img {
        width: 20px;
        height: 20px;
      }

      .btns-item-text {
        width: 400px;
        margin-left: 20px;
        margin-right: 20px;
        color: #c9c9c9;
      }

      .btns-item-right-icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.tip {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}

.sustain {
  height: 20px;
  font-size: 0.75rem;
  letter-spacing: 0.2rem;
  color: #666;
  width: auto;
  text-align: center;
  margin-right: 20px;
}

.n-input.n-input--textarea {
  border-radius: 8px;
}

.input {
  border: 0px;
}

/* 隐藏滚动进度条 */
::-webkit-scrollbar {
  display: none;
}

.moss-btns {
  position: relative;
}

.btn-style {
  width: 40px;
  height: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.btn-mode {
  background-color: var(--moss-bg-ask-color);
  border-radius: 3px;
  color: var(--moss-text-ask-color);
  padding: 1px 0px;
  font-size: 12px;
  cursor: pointer;
  // display: block;
  right: 60px;
  width: 60px;
  line-height: 22px;
}

.btn-style button {
  width: 40px;
  // max-height: 54px;
  height: 100%;
}

.moss-text {
  width: 80px;
  font-size: 12px;
  text-align: center;
  margin-top: 2px;
  white-space: nowrap;
}

.line {
  margin-top: 10px;
  margin-bottom: 10px;
}

.color {
  color: #f87171;
}

.tip-text {
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.mt10 {
  margin-top: 10px;
}

.notice-swipe {
  height: 40px;
  line-height: 40px;
}

.van-notice-bar {
  background-color: #111114 !important;
  color: #fff;
  text-align: center;

  .van-notice-bar__wrap {
    display: flex;
    justify-content: center;

    .van-swipe-item {
      color: #FF6666;
      font-size: 12px;
    }
  }
}

.v-auth {
  color: #FF6666;
  text-decoration: underline;
  font-size: 12px;
}

.relevance-main {
  display: flex;
  justify-items: center;
  color: #FF6666 !important;
  align-items: center;
  margin-right: 20px;

  .relevance-main-text {
    font-size: 12px;
    margin-left: 6px;
  }
}

:root:root {
  --van-switch-size: 15px;
}

#scrollRef {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.left-btns {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  .network-btn {
    width: 20px;
    height: 20px;
    cursor: pointer;
    filter: grayscale(0%);

    &:active {
      transform: scale(.96);
    }
  }

  .network-btn-filter {
    filter: grayscale(90%);
  }
}

.uppercase {
  cursor: pointer;
}

.is3_5 {
  background-color: #ceeaca;
  color: #4fa444;
}

@media screen and(max-width: 768px) {
  .no-data-img {
    width: 250px !important;
    height: 166px !important;
  }
}
</style>
