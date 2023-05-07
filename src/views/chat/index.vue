<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NButton, NCard, NInput, NModal, NSelect, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import Guide from './guide.vue'
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
const authStore = useAuthStoreWithout()

const userStore = useUserStore()
const showModal = ref(false)
const showPaper = ref(false)
const appStore = useAppStore()

const prompt = ref<string>('')
const loading = ref<boolean>(false)
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

// 专业模式初始化
if (!localStorage.getItem('fontSizeNum')) {
  localStorage.setItem('fontSizeNum', '100%')
}
else {
  const htmlDom = document.querySelector('html') as any
  htmlDom.style.zoom = localStorage.getItem('fontSizeNum')
}

const isPlus = computed(() => {
  // 暂时关闭plus逻辑，全部人都是plus会员
  // !!userStore.userInfo.user.plusEndTime
  return true
})

if (!localStorage.getItem('isCorrelation'))
  localStorage.setItem('isCorrelation', 'true')

// const isCorrelation = ref(localStorage.getItem('isCorrelation') === 'true')
// const showNetwork = ref(localStorage.getItem('showNetwork') === 'true')
// const showNetwork = ref(false)

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
async function ConfirmNotice(msg:string){
  return new Promise((resole,reject)=>{
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
      }
    })
  })
}

async function onConversation() {

  //  console.log(userStore.residueCount, 500000, userStore.residueCount < 500000)
  if(userStore.residueCount < 500000 && userStore.isHighVersion){
    ms.error('4.0模型消耗大量字符，需50万字符才可使用。请去ChatMoss商店补充字符数或切换至3.5模型');
    return 
  }
  if(localStorage.getItem('apiKey') &&  userStore.isHighVersion){
    ms.error('4.0仅支持字符包提问，请先于设置中心移除key再进行切换');
    return
  }

  if(chatStore.isLimit){
    // console.log(chatStore.textLength)
    //  ms.error('当前问题字符数过高，请斟酌是否继续使用4.0');
   let res =  await ConfirmNotice('当前问题字符数过高，请斟酌是否继续使用4.0') 
   if(!res) return ;
  }



  const message = prompt.value

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

    // 联网功能接口
    // if (showNetwork.value && message.length < 20) {
    //   const networkData = await networkSearch({
    //     search: encodeURIComponent(message),
    //   })
    //   console.log('联网功能', networkData)
    //   if (networkData.data.length > 0)
    //     texts = `下面的问题我将给你辅助的网络信息，你从里面提炼出内容返回给用户，优先使用网络信息中的内容，并将参考的网址以[title](href)的形式输出到最后 \n 这是问题：${message} \n 这是网络信息: ${JSON.stringify(networkData.data)} \n 这是你前面的对话信息：${texts}`
    //   else ms.info('联网查询结果为空，本次回答未能参考网络信息，请换个描述再次尝试~', { duration: 5000 })
    // }

    if (localStorage.getItem('chatmossMode') === 'speciality')
      texts = `${texts} 请详细回答`

    // texts = compressCode(texts)

    const data = await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: texts,
      options: {
        ...options,
        conversationId: chatStore.getUuid,
        openaiVersion: userStore.getOpenaiVersion
      },
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        const { responseText } = xhr
        const chunk = responseText
        // console.log(chunk)
        try {
          // const data = JSON.parse(chunk)
          updateChat(chatStore.getUuid, dataSources.value.length - 1, {
            timestamp: new Date().getTime(),
            createTime: new Date().toLocaleString(),
            text: chunk ?? '',
            inversion: false,
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

function handleEnter(event: KeyboardEvent) {
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
  return loading.value || !prompt.value || prompt.value.trim() === '' || userStore.userInfo.residueCount <= 0
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
  setTimeout(() => {
    const dom = document.querySelector('#ask-question') as any
    // console.log(dom)
    dom && dom.click()
    localStorage.setItem('selectedText', '')
  }, 1500)
}

onMounted(() => {
  const selectedText = localStorage.getItem('selectedText')
  console.log('??', selectedText)
  if (selectedText) {
    prompt.value = selectedText
    clickMessage()
  }

  chatStore.chatList()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

// function getIsApiKey() {
//   return !localStorage.getItem('apiKey')
// }

const noDataInfo = [
  {
    text: '免费使用：不用登录就可以在设置中心设置Key呦~',
  },
  {
    text: '一个问题连续对话越长，消耗越多',
  },
  {
    text: '新问题新建会话可以避免浪费字符',
  },
  {
    text: '可以点击余额查看自己的剩余字符数',
  },
  {
    text: '一个字符对应OpenAI一个token（中文更费token）',
  },
]
function noDataInfoEvent(index: any) {
  // prompt.value = ''
  // prompt.value = noDataInfo[index].text
  // handleSubmit()
  // ms.info('更多问题解答和反馈，请加QQ群')
}

// 是否开启上下文功能
// function correlationEvnet() {
//   isCorrelation.value = !isCorrelation.value
//   localStorage.setItem('isCorrelation', `${isCorrelation.value}`)
//   if (isCorrelation.value)
//     ms.info('已开启上下文功能')
//   else
//     ms.info('已关闭上下文功能')
// }

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
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto chat-main">
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto" :class="[isMobile ? 'p-2' : 'p-4']">
          <template v-if="!dataSources.length">
            <div class="no-data-info">
              <!-- 标题 -->
              <div class="no-data-info-title">
                ChatMoss
                <span
                  v-if="isPlus"
                  class="bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase"
                >
                  Plus
                </span>
              </div>
              <div class="no-data-btns-list">
                <div
                  v-for="(item, index) in noDataInfo" :key="index" class="no-data-btns-item"
                  @click="noDataInfoEvent(index)"
                >
                  <img
                    class="btns-item-img" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/tip.png"
                    alt=""
                  >
                  <div class="btns-item-text">
                    {{ item.text }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources" :key="index" :date-time="item.createTime" :text="item.text"
                :inversion="item.inversion" :error="item.error" :loading="item.loading"
              />

              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  停止响应
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
      <div class="w-full max-w-screen-xl m-auto">
        <div class="moss-btns flex justify-between space-x-2">
          <NInput
            v-if="!prompt || prompt[0] !== '/'" v-model:value="prompt" class="step1" autofocus type="textarea"
            :autosize="{ minRows: 3, maxRows: 3 }" :placeholder="placeholder" @keydown="handleEnter"
          />
          <NSelect
            v-if="prompt && prompt[0] === '/'" ref="NSelectRef" v-model:value="prompt" filterable :show="true"
            :autofocus="true" :autosize="{ minRows: 3, maxRows: 3 }" placeholder="placeholder" :options="selectOption"
            label-field="key" @keydown="handleEnter"
          />
          <!-- MOSS字数 -->
          <div class="btn-style">
            <NButton id="ask-question" type="primary" :disabled="buttonDisabled" @click="handleSubmit">
              <template #icon>
                <span class="dark:text-black">
                  <SvgIcon icon="ri:send-plane-fill" />
                </span>
              </template>
            </NButton>
            <!-- <div v-if="getIsApiKey() && userStore.userInfo.residueCount < 10000" class="moss-text">
              下次消耗{{
                isCorrelation ? `${Math.ceil((prompt.length + dataSources.map(item => item.text).join('\n').length))}`
                : `${Math.ceil((prompt?.length || 0))}`
              }}字符
            </div> -->
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
  margin-top: 5%;

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

.chat-main {
	height: calc(100% - 50px);
	padding-top: 50px;
}
</style>
