<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NCard, NInput, NModal, NSelect, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import Guide from './guide.vue'
import applicationList from './applicationList.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useAuthStoreWithout, useChatStore, useUserStore, verify } from '@/store'
import { auth, fetchChatAPIProcess, paper } from '@/api'
import Login from '@/views/login/index.vue'
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
const showModal = ref(false)
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

const isPlus = computed(() => {
  // 暂时关闭plus逻辑，全部人都是plus会员
  // !!userStore.userInfo.user.plusEndTime
  return userStore.getOpenaiVersion
})

if (!localStorage.getItem('isCorrelation'))
  localStorage.setItem('isCorrelation', 'true')

let controller = new AbortController()

const ms = useMessage()

const chatStore = useChatStore()
useCopyCode()
const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex }
  = useChat()
const { scrollRef, scrollToBottom } = useScroll()

const dataSources = computed(() => chatStore.getChatByUuid())
const conversationList = computed(() =>
  dataSources.value.filter(item => !item.inversion && !item.error),
)

const userInputindex = ref<number>(0)
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
  // <!-- console.log(vals) -->
  setTimeout(() => {
    scrollToBottom()
  }, 300)
})

function handleSubmit() {
  showModal.value = false

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
  onConversation(askMsg, 2)
}
function onlineFn(askMsg: string) {
  // console.log(askMsg, 1)

  onConversation(askMsg, 1)
}
async function onConversation(askMsg?: string, type?: number) {
  //  console.log(userStore.residueCount, 500000, userStore.residueCount < 500000)
  if (userStore.residueCount < 200000 && userStore.isHighVersion && userStore.isHighVersionMsg) {
    ms.error('4.0模型消耗大量字符，需20万字符才可使用。请去ChatMoss商店补充字符数或购买包月模式，或者切换至3.5模型')
    return
  }
  if (localStorage.getItem('apiKey') && userStore.isHighVersion && userStore.isHighVersionMsg) {
    ms.error('请先去设置中心移除key再使用4.0进行提问')
    return
  }

  if (chatStore.isLimit && userStore.isHighVersion && userStore.isHighVersionMsg) {
    const res = await ConfirmNotice('当前问题字符数过高，请斟酌是否继续使用4.0')
    if (!res)
      return
  }
  // if (!chatStore.getUuid) {
  //   ms.warning('当前会话丢失,请新建会话或打开历史记录选择会话.')
  //   return
  // }
  // if (!userStore.isAsk) {
  //   ms.error('当前字数已用尽，请等待明日免费字符，或者在商店内购买字符使用，或者上传key使用')
  //   return
  // }
  //  userStore.userInfo.residueCount <= 0
  if (type === 1) {
    chatOptions = {
      conversationId: chatStore.getUuid,
      openaiVersion: userStore.getOpenaiVersion,
      appId: userStore.appIdValue,
      online: 1,
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
  scrollToBottom()

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
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        // const { responseText } = xhr
        const chunk = xhr.responseText
        // console.log(chunk,'chunk', xhr.responseText)
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
    ms.error(error.msg || error.message)
    if (error.code === 204) {
      // error.msg
      ms.error(error.msg)
      // 代表未登录
      showModal.value = true
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
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false,
      })
      return
    }

    updateChat(chatStore.getUuid, dataSources.value.length - 1, {
      timestamp: new Date().getTime(),
      createTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      ast: message,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    })
    scrollToBottom()
  }
  finally {
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
  const classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pt-0', 'pr-4', 'overflow-hidden']
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
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

const noDataInfo = [
  {
    text: '免费使用：不用登录就可以在设置中心设置Key呦~',
  },
  {
    text: '可以点击余额查看自己的剩余字符&次数',
  },
  {
    text: '问题和回答都会扣字符数',
  },
  {
    text: '在ChatMoss商店内可以购买字符和次数',
  },
  {
    text: '上下文越长，字符消耗越多',
  },
]

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
      // 代表未登录
      showModal.value = true
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
</script>

<template>
  <div class="flex flex-col w-full h-full" :class="wrapClass">
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" class="h-full overflow-hidden overflow-y-auto chat-main">
        <applicationList v-if="userStore.isAuth === 2" />
        <div v-show="!chatStore.loading" id="image-wrapper" class="w-full max-w-screen-xl m-auto flex"
          :class="[isMobile ? 'p-2' : 'p-4']" style="height: 100%;overflow: hidden">
          <template v-if="!dataSources.length">
            <div class="no-data-info text-[#000] dark:text-white w-full">
              <!-- 应用介绍 -->
              <div v-if="userStore.currentApp" class="no-data-info-text">
                应用使用说明：{{ userStore.currentApp.desc }}
              </div>
              <!-- 空态占位图 -->
              <img v-if="authStore.token && userStore.centerPicUrl" class="no-data-img" :src="userStore.centerPicUrl"
                alt="" @click="() => { go({ name: 'sign' }) }">
              <div v-else>
                <!-- 后面期望这里跳转使用教程页面 -->
                <div class="no-data-info-tip-title">
                  ChatMoss 使用说明：
                </div>
                <div class="no-data-info-tip-text">
                  1.免费使用：在左上角个人中心设置自己的key后，可无限制使用（可以不用登录）
                </div>
                <div class="no-data-info-tip-text">
                  2.登录后每日5万字符使用额度，每周参与签到可以获得7.8w字符，还有应用商店数千款应用等你探索~快去登录吧，登录后更精彩！
                </div>
                <div class="no-data-info-tip-text">
                  3.暂未未登录，您可以免费体验3万字符，字符余额可以在右上角可以查看
                </div>
                <div class="no-data-info-tip-text">
                  4.大部分问题都可以点击左上角帮助页面，自行查阅解决
                </div>
                <div class="no-data-info-tip-text">
                  5.ChatMoss商店兑换码需要登录后才可以兑换！
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div ref="scrollRef" style="width:100%;overflow:auto">
              <Message v-for="(item, index) of dataSources" :key="index" :date-time="item.createTime" :text="item.text"
                :is-show="(dataSources.length - 1 == index) && (userStore.currentApp && userStore.currentApp.system === 1)"
                :ask-msg="item.ast" :inversion="item.inversion" :error="item.error" :loading="item.loading" @ask="askFn"
                @online="onlineFn" />

              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  正在响应
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <div v-if="!userStore.userInfo.user.authed" class="text-center">
      <!-- 通关ChatMoss使用教程，获得20w字符奖励 -->
      <span class="v-auth cursor-pointer" @click="startTutorial" />
    </div>
    <footer :class="footerClass">
      <div class="w-full m-auto">
        <div class="moss-btns flex justify-between space-x-2 w-full">
          <NInput v-if="!prompt || prompt[0] !== '/'" ref="NInputRef" v-model:value="prompt" class="step1" autofocus
            type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" :placeholder="placeholder" @keydown="handleEnter" />
          <NSelect v-if="prompt && prompt[0] === '/'" ref="NSelectRef" v-model:value="prompt" filterable :show="true"
            :autofocus="true" :autosize="{ minRows: 3, maxRows: 3 }" placeholder="placeholder" :options="selectOption"
            label-field="key" @keydown="handleEnter" @input="handleSelectInput" />
          <!-- MOSS字数 -->
          <div class="btn-style">
            <NButton id="ask-question" type="primary" :disabled="buttonDisabled" @click="handleSubmit">
              <template #icon>
                <span class="dark:text-black">
                  <SvgIcon icon="ri:send-plane-fill" />
                </span>
              </template>
            </NButton>
          </div>
        </div>
      </div>
    </footer>
    <NModal v-model:show="showModal" transform-origin="center">
      <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <Login @loginSuccess="() => { handleSubmit() }" />
      </NCard>
    </NModal>
    <NModal v-model:show="showPaper" transform-origin="center">
      <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <Paper v-model:sort="nowPaperIndex" :paper-list="paperList" @success="onSuccessAuth" />
      </NCard>
    </NModal>
    <Guide />
  </div>
</template>

<style lang="less">
.no-data-info {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .no-data-info-tip-title {
    font-size: 14px;
    color: #FF6666;
    margin-bottom: 20px;
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
    // color: #fff;
    position: absolute;
    opacity: 0.5;
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

.setting {
  width: 100%;
  padding: 0px 10px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .setting-main {
    display: flex;
    align-items: center;
    cursor: pointer;

    .setting-text {
      color: #FF6666;
      font-size: 10px;
    }

    .setting-btn {
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
  }
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

.shake {
  transform-origin: bottom bottom;
  animation: animashake 1.5s .2s ease-in-out both infinite;
}

@keyframes animashake {

  0%,
  100% {
    transform: rotate(0deg);
    transform-origin: 50% 0;
  }

  5% {
    transform: rotate(2deg);
  }

  10%,
  20%,
  30% {
    transform: rotate(-4deg);
  }

  15%,
  25%,
  35% {
    transform: rotate(4deg);
  }

  40% {
    transform: rotate(-2deg);
  }

  45% {
    transform: rotate(2deg);
  }

  50% {
    transform: rotate(0deg);
  }
}

#scrollRef {
  display: flex;
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
