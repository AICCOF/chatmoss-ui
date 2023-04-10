<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NCard, NInput, NModal, NPopover, NSelect, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { fetchChatAPIProcess, networkSearch } from '@/api'
import Login from '@/views/login/index.vue'
import { t } from '@/locales'
import selectOption from '@/assets/chatmoss.json'

const userStore = useUserStore()
const showModal = ref(false)
const appStore = useAppStore()

if (!localStorage.getItem('chatMossPiecesNumber'))
  localStorage.setItem('chatMossPiecesNumber', '30')

appStore.setTheme('dark')

const isPlus = computed(() => {
  // 暂时关闭plus逻辑，全部人都是plus会员
  // !!userStore.userInfo.user.plusEndTime
  return true
})

const isCorrelation = ref(true)
const showNetwork = ref(localStorage.getItem('showNetwork') === 'true')

let controller = new AbortController()

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()
useCopyCode()
const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex }
	= useChat()
const { scrollRef, scrollToBottom } = useScroll()

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
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
const prompt = ref<string>('')
const loading = ref<boolean>(false)

function handleSubmit() {
  showModal.value = false
  userStore.residueCountAPI()
  onConversation()
}

// 计算消耗的字符数量
function addTextNum(num: any) {
  console.log('num', num)
  let chatMossTextNum = localStorage.getItem('chatMossTextNum')
  if (!chatMossTextNum)
    chatMossTextNum = '0'
  localStorage.setItem('chatMossTextNum', num + Number(chatMossTextNum))
}

async function onConversation() {
  const message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
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

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: '',
    loading: true,
    inversion: false,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } },
  })
  scrollToBottom()

  try {
    const chatMossPiecesNumber = Number(localStorage.getItem('chatMossPiecesNumber')) + 2
    console.log('chatMossPiecesNumber', chatMossPiecesNumber)
    // 在这里拼接用户所有的上下文
    let texts = isCorrelation.value ? dataSources.value.slice(-chatMossPiecesNumber).map(item => item.text).join('\n') : message

    // 联网功能接口
    if (showNetwork.value && message.length < 20) {
      const networkData = await networkSearch({
        search: encodeURIComponent(message),
      })
      console.log('联网功能', networkData)
      if (networkData.data.length > 0)
        texts = `下面的问题我将给你辅助的网络信息，你从里面提炼出内容返回给用户，优先使用网络信息中的内容，并将参考的网址以[title](href)的形式输出到最后 \n 这是问题：${message} \n 这是网络信息: ${JSON.stringify(networkData.data)} \n 这是你前面的对话信息：${texts}`
      else ms.info('联网查询结果为空，本次回答未能参考网络信息，请换个描述再次尝试~', { duration: 5000 })
    }

    await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: texts,
      options,
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target

        const { responseText } = xhr
        // Always process the final line
        const lastIndex = responseText.lastIndexOf('\n')
        let chunk = responseText

        if (lastIndex !== -1)
          chunk = responseText.substring(lastIndex)
        try {
          const data = JSON.parse(chunk)
          updateChat(+uuid, dataSources.value.length - 1, {
            dateTime: new Date().toLocaleString(),
            text: data.text ?? '',
            inversion: false,
            error: false,
            loading: false,
            conversationOptions: {
              conversationId: data.conversationId,
              parentMessageId: data.id,
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
    addTextNum(texts.length)
    scrollToBottom()
  }
  catch (error: any) {
    console.error(error)
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
      updateChatSome(+uuid, dataSources.value.length - 1, {
        loading: false,
      })
      scrollToBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(
      +uuid,
      dataSources.value.length - 1,
    )

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(+uuid, dataSources.value.length - 1, {
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false,
      })
      return
    }

    updateChat(+uuid, dataSources.value.length - 1, {
      dateTime: new Date().toLocaleString(),
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

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  const message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(+uuid, index, {
    dateTime: new Date().toLocaleString(),
    text: '',
    inversion: false,
    error: false,
    loading: true,
    conversationOptions: null,
    requestOptions: { prompt: message, ...options },
  })

  try {
    await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: message,
      options,
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        const { responseText } = xhr
        // Always process the final line
        const lastIndex = responseText.lastIndexOf('\n')
        let chunk = responseText
        if (lastIndex !== -1)
          chunk = responseText.substring(lastIndex)
        try {
          const data = JSON.parse(chunk)
          updateChat(+uuid, index, {
            dateTime: new Date().toLocaleString(),
            text: data.text ?? '',
            inversion: false,
            error: false,
            loading: false,
            conversationOptions: {
              conversationId: data.conversationId,
              parentMessageId: data.id,
            },
            requestOptions: { prompt: message, ...options },
          })
        }
        catch (error) {
          //
        }
      },
    })
    addTextNum(message.length)
  }
  catch (error: any) {
    console.error(error)
    if (error.message === 'canceled') {
      updateChatSome(+uuid, index, {
        loading: false,
      })
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(+uuid, index, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, ...options },
    })
  }
  finally {
    loading.value = false
  }
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
  else if (userInputList.value.length && (!prompt.value || prompt.value[0] !== '/')) {
    if (event.key === 'ArrowUp') {
      currentIndex.value -= 1
      prompt.value = userInputList.value[currentIndex.value].text
    }
    else if (event.key === 'ArrowDown') {
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
  if (isMobile.value)
    return ['pt-14']
  return []
})

const footerClass = computed(() => {
  let classes = ['p-4', 'pt-0']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pt-0', 'pr-4', 'overflow-hidden']
  return classes
})

onMounted(() => {
  const selectedText = localStorage.getItem('selectedText')
  /* eslint no-console: "off" */
  console.log('selectedText', selectedText)
  if (selectedText) {
    setTimeout(() => {
      const questionListDom = document.querySelector('.question-list') as HTMLDivElement
      const questionBtnDom = document.querySelector('#question-btn') as HTMLDivElement
      if (questionListDom === null || questionListDom.innerText !== '新建问题') {
        questionBtnDom.click()
        prompt.value = selectedText
      }
      else {
        prompt.value = selectedText
      }
      setTimeout(() => {
        const askQuestionDom = document.querySelector('#ask-question') as HTMLDivElement
        askQuestionDom.click()
        localStorage.setItem('selectedText', '')
        // 防止接口请求太快，导致点击被禁止
        setTimeout(() => {
          askQuestionDom.click()
        }, 1500)
      }, 300)
      console.log('建立新的对话，塞入优化空间')
    }, 300)
  }
  scrollToBottom()
  userStore.residueCountAPI()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

function getIsApiKey() {
  return !localStorage.getItem('apiKey') || !localStorage.getItem('SECRET_TOKEN')
}

const noDataInfo = [
  {
    text: '出一道算法题',
  },
  {
    text: '出一道脑筋急转弯',
  },
  {
    text: '给我讲一个冷笑话',
  },
  {
    text: '用Python写一个猜数字的游戏',
  },
  {
    text: '推荐一下每日健康饮食规划',
  },
]
function noDataInfoEvent(index: any) {
  prompt.value = ''
  prompt.value = noDataInfo[index].text
  handleSubmit()
}

// 是否开启联网功能
function networkEvnet() {
  if (!localStorage.getItem('SECRET_TOKEN')) {
    ms.error('需要登录才能使用联网功能')
    return
  }
  showNetwork.value = !showNetwork.value
  localStorage.setItem('showNetwork', `${showNetwork.value}`)
  if (showNetwork.value)
    ms.info('ChatMoss已接入联网，这将大幅度消耗您的字符数；并且超过20个字符的问题不会联网查询~')
  else
    ms.info('ChatMoss已退出联网')
}
// 是否开启上下文功能
function correlationEvnet() {
  isCorrelation.value = !isCorrelation.value
  localStorage.setItem('isCorrelation', `${isCorrelation.value}`)
  if (isCorrelation.value)
    ms.info('已开启上下文功能')
  else
    ms.info('已关闭上下文功能')
}
// const mossCount = computed(() => {
//   if (!userStore.userInfo.user.plusEndTime)
//     return ''
//   console.log('时间', userStore.userInfo.user.plusEndTime)
//   const timestamp = userStore.userInfo.user.plusEndTime
//   const date = new Date(timestamp)
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   const hours = String(date.getHours()).padStart(2, '0')
//   const minutes = String(date.getMinutes()).padStart(2, '0')
//   const dateString = `${year}/${month}/${day} ${hours}:${minutes} 到期`
//   return dateString
// })
</script>

<template>
  <div class="flex flex-col w-full h-full" :class="wrapClass">
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto" :class="[isMobile ? 'p-2' : 'p-4']">
          <template v-if="!dataSources.length">
            <div class="no-data-info">
              <!-- 标题 -->
              <div class="no-data-info-title">
                ChatMoss
                <span v-if="isPlus" class="bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase">
                  Plus
                </span>
              </div>
              <!-- <div class="no-data-info-tip">
                {{ mossCount }}
              </div> -->
              <!-- 功能展示列表 -->
              <div class="no-data-btns-list">
                <div
                  v-for="(item, index) in noDataInfo"
                  :key="index"
                  class="no-data-btns-item"
                  @click="noDataInfoEvent(index)"
                >
                  <img class="btns-item-img" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss-plus/icon1.png" alt="">
                  <div class="btns-item-text">
                    {{ item.text }}
                  </div>
                  <img class="btns-item-right-icon" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/right-icon.png" alt="">
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources" :key="index" :date-time="item.dateTime" :text="item.text"
                :inversion="item.inversion" :error="item.error" :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
              />

              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  Stop Responding
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <!-- <Tips @login="showModelEvent" /> -->
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="moss-btns flex items-center justify-between space-x-2">
          <!-- 左侧拓展区域 -->
          <div class="left-btns">
            <NPopover trigger="hover">
              <template #trigger>
                <img class="network-btn" :class="{ 'network-btn-filter': !isCorrelation }" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/context-btn.png" alt="上下文功能" @click="correlationEvnet">
              </template>
              <span>是否开启上下文</span>
            </NPopover>
            <NPopover trigger="hover">
              <template #trigger>
                <img class="network-btn" :class="{ 'network-btn-filter': !showNetwork }" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/network-btn.png" alt="联网功能" @click="networkEvnet">
              </template>
              <span>是否开启联网</span>
            </NPopover>
          </div>
          <NInput
            v-if="!prompt || prompt[0] !== '/'"
            v-model:value="prompt"
            autofocus
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="placeholder"
            clearable
            @keydown="handleEnter"
          />
          <NSelect
            v-if="prompt && prompt[0] === '/'"
            v-model:value="prompt"
            filterable
            :show="true"
            :autofocus="true"
            :show-on-focus="true"
            :autosize="{ minRows: 1, maxRows: 5 }"
            placeholder="placeholder"
            :options="selectOption"
            clearable
            label-field="key"
            @keydown="handleEnter"
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
            <div v-if="getIsApiKey() && userStore.userInfo.residueCount < 10000" class="moss-text">
              下次消耗{{
                isCorrelation ? `${Math.ceil((prompt.length + dataSources.map(item => item.text).join('\n').length))}` : `${Math.ceil((prompt?.length || 0))}`
              }}字符
            </div>
          </div>
        </div>
      </div>
    </footer>
    <NModal v-model:show="showModal" transform-origin="center">
      <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <Login @loginSuccess="() => { handleSubmit() }" />
      </NCard>
    </NModal>
  </div>
</template>

<style lang="less">
.no-data-info {
  margin-top: 5%;
  .no-data-info-title {
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
      cursor: pointer; /* 显示小手 */
      &:hover {
        border: 1px solid #3c9af7;
      }
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
  border-radius: 50px;
}

/* 隐藏滚动进度条 */
::-webkit-scrollbar {
  display: none;
}

.moss-btns {
  position: relative;
}

.btn-style {
	width: 80px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.btn-style button {
	width: 50px;
	height: 30px;
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
	width: 80px;
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
</style>
