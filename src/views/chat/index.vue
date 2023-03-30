<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NCard, NInput, NModal, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import Tips from './tips.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import Login from '@/views/login/index.vue'
import { t } from '@/locales'

const userStore = useUserStore()
const showModal = ref(false)
const showSettingModal = ref(false)
const apiKey = ref(localStorage.getItem('apiKey')) as any
const appStore = useAppStore()

appStore.setTheme('dark')

const isCorrelation = ref(false)

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

const prompt = ref<string>('')
const loading = ref<boolean>(false)

function handleSubmit() {
  showModal.value = false
  userStore.residueCountAPI()
  onConversation()
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
    const texts = isCorrelation.value ? dataSources.value.map(item => item.text).join('\n') : message
    // 在这里拼接用户所有的上下文
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
}

function showModelEvent() {
  showModal.value = true
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

function handleSettingSubmit() {
  if (!localStorage.getItem('SECRET_TOKEN')) {
    ms.info('请先登录~', { duration: 5000 })
    return
  }
  showSettingModal.value = true
}

function settingBtn() {
  localStorage.setItem('apiKey', apiKey.value)
  showSettingModal.value = false
  ms.info('设置成功~', { duration: 5000 })
}

function getIsApiKey() {
  return !localStorage.getItem('apiKey') || !localStorage.getItem('SECRET_TOKEN')
}
</script>

<template>
  <div class="flex flex-col w-full h-full" :class="wrapClass">
    <div class="setting">
      <div class="setting-main" @click="handleSettingSubmit">
        <img class="setting-btn" :class="{ shake: getIsApiKey() }" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v1.3/setting.png" alt="">
        <div class="setting-text">
          设置ApiKey（解锁ChatMoss使用限制）
        </div>
      </div>
      <div class="relevance-main">
        <van-switch v-model="isCorrelation" active-color="#FF6666" inactive-color="#dcdee0" />
        <div class="relevance-main-text">
          启动上下文
        </div>
      </div>
    </div>
    <NModal v-model:show="showSettingModal">
      <NCard
        style="width: 600px"
        title="设置ApiKey"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <NInput v-model:value="apiKey" type="text" placeholder="请输入您的apiKey" />
        <NButton class="mt10" type="primary" ghost @click="settingBtn">
          确定
        </NButton>
        <hr class="line">
        <div>如何获得key</div>
        <div>最便捷 购买ChatMoss官方key | 自动发货 | <span class="color">支付宝 扫码购买</span></div>
        <img width="150" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v1.3/zfbgm.png" alt="">
        <div class="tip-text">
          ChatMoss提供的apiKey要稍微贵一些，支持官方，让官方做更多更好的功能，感谢大家
        </div>
        <hr class="line">
        <div>其他获取key的方式</div>
        <div>注册OpenAi账号，访问这里即可：https://platform.openai.com/account/billing/overview</div>
      </NCard>
    </NModal>
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto" :class="[isMobile ? 'p-2' : 'p-4']">
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <img
                width="20" class="mr-2 text-3xl"
                src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo.png" alt=""
              >
              <span>Hi~ {{ userStore.userInfo.user.nickname }}</span>
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
    <Tips @login="showModelEvent" />
    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="moss-btns flex items-center justify-between space-x-2">
          <NInput
            v-model:value="prompt"
            autofocus
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 2 }"
            :placeholder="placeholder"
            @keypress="handleEnter"
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
            <div v-if="getIsApiKey()" class="moss-text">
              下次消耗{{
                isCorrelation ? `${Math.ceil((prompt.length + dataSources.map(item => item.text).join('\n').length))}` : `${Math.ceil((prompt.length))}`
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
</style>
