<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NCard, NCarousel, NCarouselItem, NInput, NModal, NSelect, useDialog, useMessage } from 'naive-ui'
import { showConfirmDialog } from 'vant'
import { Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import Guide from './guide.vue'
import applicationSlide from './applicationSlide.vue'
import Footer from './layout/footerNew/index.vue'
import applicationIntro from './application_intro.vue'
import Sider from './layout/sider/index.vue'
import Header from './layout/header/index.vue'
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
import { conversationReport, getLatestCharTwoReduceInfo } from '@/api/weixin'
import { checkPlugin, execPlugin } from '@/api/plugin'
import { getButtonList } from '@/api/application'
import { trace } from '@/api/invite'
import { jumpLink } from '@/utils/jumpLink'
const hidden = computed(() => {
  return location.search.includes('hiddenInput')
})
// console.log(hidden)
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
  localStorage.setItem('fontSizeNum', '90%')
}
else {
  const fontSizeNumNew: any = localStorage.getItem('fontSizeNum') || '90%' // 默认值为 90%
  let parsedFontSize = parseFloat(fontSizeNumNew)
  if (isNaN(parsedFontSize))
    parsedFontSize = 65 // 默认最小值
  parsedFontSize = Math.max(65, Math.min(150, parsedFontSize)) // 范围限制
  localStorage.setItem('fontSizeNum', `${parsedFontSize}%`)
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
const { scrollRef, scrollToBottom, goToBottom, scrollToTop, isTop, isEnd } = useScroll()

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
  // userStore.residueCountAPI()
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
function askFn(askMsg: string, replayMsgId: string, position) {
  onConversation(askMsg, {
    replay: 1,
    replayMsgId,
    position,
  })
}
function onlineFn(askMsg: string) {
  // console.log(askMsg, 1)

  onConversation(askMsg, { online: 1 })
}
function jarvisFn(askMsg: string) {
  onConversation(askMsg, { jarvis: 1 })
}

function reportCallback(row: any) {
  Modal.confirm({
    title: '举报',
    content: '当前回答内容您是否觉得不符合正确社会价值观，是否进行举报，我们将对这条内容进行删除处理，感谢您的反馈',
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      // console.log('OK');
      const res = await conversationReport({
        conversationId: row.conversationId,
        id: row.id,
      })
      ms.success('举报成功')
      row.text = res.msg || '内容不符合平台生成规定，已被清理'
    },
    onCancel() {
      console.log('Cancel')
    },
  })
}

async function onConversation(askMsg?: string, opt?) {
  if (chatStore.isLimit && userStore.isHighVersion && userStore.isHighVersionMsg) {
    const res = await ConfirmNotice('当前问题字符数过高，请斟酌是否继续使用4.0')
    if (!res)
      return
  }
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
  if (opt && opt.replay) {
    // 重复提问
    await replayQuestions(message, opt)
  }
  else {
    chatStore.clearQuestionMode()
    await newQuestions(message)
  }
}
async function replayQuestions(message, opt) {
  let options: Chat.ConversationRequest = {}
  const lastContext
    = conversationList.value[conversationList.value.length - 1]
      ?.conversationOptions
  loading.value = true
  if (lastContext)
    options = { ...lastContext }
  let contentList = []
  const row = getChatByUuidAndIndex(chatStore.getUuid, opt.position)
  console.log(row, opt.position)
  if (row)
    contentList = row.contentList || []

  contentList.push('')
  updateChat(chatStore.getUuid, opt.position, {
    ...row,
    timestamp: new Date().getTime(),
    createTime: new Date().toLocaleString(),
    contentList,
    loading: true,

  })
  //  console.log(opt.position, getChatByUuidAndIndex(chatStore.getUuid, opt.position))
  //  return ;
  const selectPlugin = chatStore.getSelectPluginInfo
  const pluginId = selectPlugin?.pluginId // 插件ID
  try {
    const chatMossPiecesNumber = Number(localStorage.getItem('chatMossPiecesNumber')) + 2
    // console.log('chatMossPiecesNumber', chatMossPiecesNumber)
    // 在这里拼接用户所有的上下文
    let texts = message
    const token = getToken()
    if (!token && verify(chatStore.getUuid))
      texts = dataSources.value.slice(-chatMossPiecesNumber).map(item => item.text).join('\n')

    if (localStorage.getItem('chatmossMode') === 'speciality')
      texts = `${texts} 请详细回答`

    // texts = compressCode(texts)
    let execPluginResponse: any = {}
    let pluginObj = {}
    const isPlugin = checkValues()
    if (selectPlugin && chatStore.getSelectPluginInfo?.select && !isPlugin)
      ms.error('温馨提示，因为成本问题，插件功能只有3.5月卡以上付费用户才可使用，所以本次回答并未调用插件功能~如购买月卡后还有此提示，请重新登录后即可~')

    if (selectPlugin && chatStore.getSelectPluginInfo?.select && isPlugin) {
      /**
       * 执行插件逻辑
       */
      chatStore.setPlugState(0)
      const response = await checkPlugin({
        pluginId,
        tags: userStore.userInfo.tags,
        messages: [
          {
            role: 'user',
            content: texts,
          },
        ],
      })
      // console.log('1.判断是否执行插件', response.checkPluginInfo.function_call)
      const fn = response.checkPluginInfo.function_call

      // 执行插件内容
      if (fn) {
        pluginObj = {
          pluginId,
        }
        updateChat(chatStore.getUuid, opt.position, {
          ...row,
          timestamp: new Date().getTime(),
          createTime: new Date().toLocaleString(),
          text: '',
          contentList,
          inversion: false,
          ast: message,
          error: false,
          loading: true,
          pluginInfo: {
            ast: message,
            pluginMessage: '',
            ...pluginObj,
          },
          conversationOptions: {
            conversationId: chatStore.getUuid,
          },
          requestOptions: { prompt: message, options: { ...options } },
        })
        // 插件展示状态：0 没执行，1 执行中，2 执行完成
        chatStore.setPlugState(1)
        // console.log('2.插件可执行：', JSON.parse(fn.arguments))

        // 执行内容
        execPluginResponse = await execPlugin({
          pluginId,
          args: JSON.parse(fn.arguments),
        })
        // console.log('3.插件执行结果：', execPluginResponse.pluginStr)

        texts = `${texts}\n|$moss${JSON.stringify(pluginObj)}$moss|${execPluginResponse.pluginStr ? execPluginResponse.pluginStr : ''
          }`

        updateChat(chatStore.getUuid, opt.position, {
          ...row,
          timestamp: new Date().getTime(),
          createTime: new Date().toLocaleString(),
          text: '',
          contentList,
          inversion: false,
          ast: message,
          error: false,
          loading: true,
          pluginInfo: {
            ast: message,
            pluginMessage: execPluginResponse.pluginStr,
            ...pluginObj,
          },
          conversationOptions: {
            conversationId: chatStore.getUuid,
          },
          requestOptions: { prompt: message, options: { ...options } },
        })
      }
    }

    const data = await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: texts,
      options: {
        ...options,
        ...chatOptions,
        conversationId: chatStore.getUuid,
      },
      apiKey: userStore.useKey === '1' ? localStorage.getItem('apiKey') : '',
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        // const { responseText } = xhr
        const chunk = xhr.responseText
        contentList[contentList.length - 1] = chunk

        try {
          // const data = JSON.parse(chunk)
          updateChat(chatStore.getUuid, opt.position, {
            ...row,
            timestamp: new Date().getTime(),
            createTime: new Date().toLocaleString(),
            text: chunk ?? '',
            contentList,
            inversion: false,
            ast: message,
            error: false,
            loading: false,
            pluginInfo: {
              ast: message,
              pluginMessage: execPluginResponse.pluginStr,
              ...pluginObj,
            },
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
    console.log(error)
    if (error.code === 10000) {
      showConfirmDialog({
        title: '问题',
        message: '您当前问题已经超过模型最大上下文，是否新建问题解决此问题',
        confirmButtonText: '新建问题',
        cancelButtonText: '取消',
      }).then(() => {
        // on close
        // userStore.toggleOpenaiVersion();
        chatStore.createChat()
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
    else if (error.code === 20000) {
      showConfirmDialog({
        title: '字符已用尽',
        message: '试用字符已经用尽，目前ChatMoss 3.5登录后可免费使用，是否登录',
        confirmButtonText: '去登录',
        cancelButtonText: '知道了',
      }).then(() => {
        // on close
        // userStore.toggleOpenaiVersion()
        go({
          name: 'login',
        })
      })
    }
    else if (error.message === 'canceled') {
      // 处理取消
      updateChatSome(chatStore.getUuid, opt.position, {
        loading: false,
      })
      scrollToBottom()
      return
    }
    const errorMessage = error.msg || '已取消'
    contentList[contentList.length - 1] = `${errorMessage}`
    console.log(errorMessage !== undefined)
    if (errorMessage !== undefined) {
      updateChatSome(chatStore.getUuid, opt.position, {
        text: `${errorMessage || '已取消'}`,
        contentList,
        error: true,
        loading: false,
      })
    }
    else {

    }
  }
  finally {
    if (chatStore.plugState === 1)
      chatStore.setPlugState(2) // 插件结束状态

    setTimeout(() => {
      // 问答结束后2s,去服务端拿结果。
      if (loading.value && !verify(chatStore.getUuid)) {
        getLatestCharTwoReduceInfo({
          conversationId: chatStore.getUuid,
        }).then((res) => {
          row.mossReduceInfoList.push(res.data[0])
          updateChat(chatStore.getUuid, opt.position, {
            ...row,
          })
        })

        userStore.residueCountAPI()
        loading.value = false
      }
    }, 2000)
  }
}

async function newQuestions(message) {
  if(userStore.appIdValue==='2'){
   await chatStore.createChat(message)
  }
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
  const contentList = []

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
  const selectPlugin = chatStore.getSelectPluginInfo
  const pluginId = selectPlugin?.pluginId // 插件ID
  try {
    const chatMossPiecesNumber = Number(localStorage.getItem('chatMossPiecesNumber')) + 2
    // console.log('chatMossPiecesNumber', chatMossPiecesNumber)
    // 在这里拼接用户所有的上下文
    let texts = message
    const token = getToken()
    if (!token && verify(chatStore.getUuid))
      texts = dataSources.value.slice(-chatMossPiecesNumber).map(item => item.text).join('\n')

    if (localStorage.getItem('chatmossMode') === 'speciality')
      texts = `${texts} 请详细回答`

    // texts = compressCode(texts)
    let execPluginResponse: any = {}
    let pluginObj = {}
    const isPlugin = checkValues()
    if (token && selectPlugin && chatStore.getSelectPluginInfo?.select && !isPlugin)
      ms.error('温馨提示，因为成本问题，插件功能只有3.5月卡以上付费用户才可使用，所以本次回答并未调用插件功能~如购买月卡后还有此提示，请重新登录后即可~')

    if (token && selectPlugin && chatStore.getSelectPluginInfo?.select && isPlugin) {
      /**
       * 执行插件逻辑
       */
      chatStore.setPlugState(0)
      const response = await checkPlugin({
        pluginId,
        tags: userStore.userInfo.tags,
        messages: [
          {
            role: 'user',
            content: texts,
          },
        ],
      })
      // console.log('1.判断是否执行插件', response.checkPluginInfo.function_call)
      const fn = response.checkPluginInfo.function_call

      // 执行插件内容
      if (fn) {
        pluginObj = {
          pluginId,
        }
        updateChat(chatStore.getUuid, dataSources.value.length - 1, {
          timestamp: new Date().getTime(),
          createTime: new Date().toLocaleString(),
          text: '',
          contentList,
          inversion: false,
          ast: message,
          error: false,
          loading: false,
          pluginInfo: {
            ast: message,
            pluginMessage: '',
            ...pluginObj,
          },
          conversationOptions: {
            conversationId: chatStore.getUuid,
          },
          requestOptions: { prompt: message, options: { ...options } },
        })
        // 插件展示状态：0 没执行，1 执行中，2 执行完成
        chatStore.setPlugState(1)
        // console.log('2.插件可执行：', JSON.parse(fn.arguments))

        // 执行内容
        execPluginResponse = await execPlugin({
          pluginId,
          args: JSON.parse(fn.arguments),
        })
        // console.log('3.插件执行结果：', execPluginResponse.pluginStr)

        texts = `${texts}\n|$moss${JSON.stringify(pluginObj)}$moss|${execPluginResponse.pluginStr ? execPluginResponse.pluginStr : ''
          }`

        updateChat(chatStore.getUuid, dataSources.value.length - 1, {
          timestamp: new Date().getTime(),
          createTime: new Date().toLocaleString(),
          text: '',
          inversion: false,
          ast: message,
          error: false,
          loading: false,
          pluginInfo: {
            ast: message,
            pluginMessage: execPluginResponse.pluginStr,
            ...pluginObj,
          },
          conversationOptions: {
            conversationId: chatStore.getUuid,
          },
          requestOptions: { prompt: message, options: { ...options } },
        })
      }
    }

    console.log('data', options)
    const data = await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: texts,
      options: {
        ...options,
        ...chatOptions,
        conversationId: chatStore.getUuid,
      },
      apiKey: userStore.useKey === '1' ? localStorage.getItem('apiKey') : '',
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        // const { responseText } = xhr
        const chunk = xhr.responseText
        contentList[0] = chunk
        // console.log(contentList)
        try {
          // const data = JSON.parse(chunk)
          updateChat(chatStore.getUuid, dataSources.value.length - 1, {
            timestamp: new Date().getTime(),
            createTime: new Date().toLocaleString(),
            text: chunk ?? '',
            inversion: false,
            ast: message,
            contentList,
            error: false,
            loading: false,
            pluginInfo: {
              ast: message,
              pluginMessage: execPluginResponse.pluginStr,
              ...pluginObj,
            },
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
    console.log(error.msg, error.message)

    if (error.code === 10000) {
      showConfirmDialog({
        title: '问题',
        message: '您当前问题已经超过模型最大上下文，是否新建问题解决此问题',
        confirmButtonText: '新建问题',
        cancelButtonText: '取消',
      }).then(() => {
        // on close
        // userStore.toggleOpenaiVersion();
        chatStore.createChat()
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
    else if (error.code === 20000) {
      showConfirmDialog({
        title: '字符已用尽',
        message: '试用字符已经用尽，目前ChatMoss 3.5登录后可免费使用，是否登录',
        confirmButtonText: '去登录',
        cancelButtonText: '知道了',
      }).then(() => {
        // on close
        // userStore.toggleOpenaiVersion()
        go({
          name: 'login',
        })
      })
    }
    else if (error.message === 'canceled') {
      // 处理取消
      updateChatSome(chatStore.getUuid, opt.position, {
        loading: false,
      })
      scrollToBottom()
      return
    }
    const errorMessage = error.msg || '已取消'
    if (errorMessage !== undefined) {
      updateChatSome(chatStore.getUuid, dataSources.value.length - 1, {
        text: `${errorMessage}`,
        contentList: [errorMessage],
        error: true,
        loading: false,
      })
    }
  }
  finally {
    if (chatStore.plugState === 1)
      chatStore.setPlugState(2) // 插件结束状态

    setTimeout(() => {
      // 问答结束后2s,去服务端拿结果。
      if (loading.value && !verify(chatStore.getUuid)) {
        getLatestCharTwoReduceInfo({
          conversationId: chatStore.getUuid,
        }).then((res) => {
          updateChatSome(chatStore.getUuid, dataSources.value.length - 1, {
            mossReduceInfo: {
              id: res.data[0].id,
              questionMode: res.data[0].questionMode,
              viewMsg: res.data[0].viewMsg,
            },
            loading: false,
            mossReduceInfoList: [res.data[0]],
            conversationId: chatStore.getUuid,
            id: res.data[0].id,
          })

          updateChatSome(chatStore.getUuid, dataSources.value.length - 2, {
            mossReduceInfo: {
              ...res.data[1],
              questionMode: res.data[0].questionMode,
              viewMsg: res.data[0].viewMsg,
            },
            conversationId: chatStore.getUuid,
            id: res.data[1].id,
          })
        })

        userStore.residueCountAPI()
        loading.value = false
      }
      else {
        loading.value = false
      }
    }, 2000)
  }
}

/**
 * 是否执行插件
 */
function checkValues() {
  const arr = userStore.userInfo.tags
  // 检查 arr 是否是 null 或 undefined
  if (arr == null || !Array.isArray(arr))
    return false

  for (const item of arr) {
    // 检查 item 是否是 null 或 undefined
    if (item == null || typeof item !== 'object')
      continue

    // 检查 item.name 是否是 null 或 undefined
    if (item.name != null)
      return true
  }

  return false
}

window.onConversation = onConversation

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
  // console.log('??', selectedText)
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
  userStore.getApplicationInstallListAPI()
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
const tabList = ref([])
getButtonListAPI()
async function getButtonListAPI() {
  const res = await getButtonList({
    type: 1,
  })
  // console.log(res)
  tabList.value = res.data || []
}
function handleNewPerson() {
  trace({
    eventName: 'h5Click',
    customField: {
      scene: '新人礼包', // 场景
    },
  })
  go({
    name: 'h5',
    query: {
      url: 'http://h5.aihao123.cn/pages/app/new-persion/index.html',
    },
  })
}
const router = useRouter()
function handleDump(item) {
  trace({
    eventName: 'h5Click',
    customField: {
      scene: '首页banner', // 场景
      id: item.id, // 对应的首页banner的ID
    },
  })
  const json = JSON.parse(item.jumpUrl)
  jumpLink(json, router)
}

// userStore.currentApp.iframeToken = 0;
// userStore.currentApp.iframeUrl = 'https://www.baidu.com'
const iframePath = computed(() => {
  if (userStore.currentApp && userStore.currentApp.iframeToken === 0) {
    return userStore.currentApp.iframeUrl
  }
  else {
    const url = new URL(userStore.currentApp.iframeUrl)
    url.searchParams.set('token', getToken())
    return url.toString()
  }
})
</script>

<template>
  <div class="flex flex-col w-full h-full bg-[#F6F7FA] dark:bg-[#161616]" :class="wrapClass">
    <img v-if="userStore.newUser"
      src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/icon-gift.png"
      class="element-to-animate" alt="" style="position: fixed;right:11px;top:105px;width: 110px;z-index: 1000;"
      @click.stop="handleNewPerson">

    <Sider />
    <Header />
    <main class="flex flex-1 overflow-hidden">
      <applicationSlide v-if="userStore.userInfo.user" />
      <div v-if="userStore.currentApp && userStore.currentApp.iframeUrl" id="scrollRef"
        class="h-full overflow-hidden overflow-y-auto chat-main" :class="[userStore.toggleValue ? 'p90' : '']">
        <iframe :src="iframePath" frameborder="0" style="width:100%;height:100%;" />
      </div>

      <div v-else id="scrollRef" class="h-full overflow-hidden overflow-y-auto chat-main"
        :class="[userStore.toggleValue ? 'p90' : '']">
        <div id="image-wrapper" class="w-full m-auto items-center pb-4 relative" :class="[isMobile ? 'px-2' : 'px-4']"
          style="height: 100%;overflow: hidden">
          <div id="scrollRef1" ref="scrollRef" class="pt-[12px]"
            style="width:100%;height:100%;overflow:auto;display: flex; flex-wrap: wrap; ">
            <applicationIntro style="width: 100%;" />
            <transition name="fade1">
              <div v-if="isEnd" class="icon-top" style="" @click="scrollToTop">
                <SvgIcon icon="grommet-icons:link-top" />
              </div>
            </transition>

            <transition name="fade1">
              <div v-if="isTop" class="icon-top" @click="goToBottom">
                <SvgIcon icon="grommet-icons:link-bottom" />
              </div>
            </transition>

            <div class="" style="width: 100%;">
              <div v-if="!dataSources.length && !userStore.isQuestionMode" class="no-data-info w-full" style="pointer-events: none;">
                <!-- 应用介绍 -->

                <!-- 空态占位图 -->
                <div style="width: 100%;pointer-events: all;">
                  <NCarousel autoplay dot-placement="top" mousewheel show-arrow
                    style="width: 80%;max-width:420px;margin: 0 auto;" :interval="3000">
                    <NCarouselItem v-for="(item, i) of tabList" :key="i" style="border-radius: 10px;overflow: hidden;">
                      <img class="cursor-pointer" :src="item.iconUrl"
                        style="height: 100%;object-fit: contain; border-radius: 10px; margin: 0 auto;"
                        @click="handleDump(item)">
                    </NCarouselItem>

                    <template #arrow="{ prev, next }">
                      <div class="custom-arrow">
                        <button type="button" style="
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        margin-top: -15px;
                        font-size: 30px;
                        color:rgb(0, 122, 255);
                      " @click="next">
                          <!-- <SvgIcon icon="uiw:right" class="icon" /> -->
                          <img
                            src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/icon-left-arrow.png"
                            style="width: 40px;transform: rotateZ(180deg);" alt="">
                        </button>
                        <button type="button" style="
                        position: absolute;
                        left:10px;
                        top: 50%;
                        margin-top: -15px;
                        font-size: 30px;
                        color:rgb(0, 122, 255);
                      " @click="prev">
                          <img
                            src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/icon-left-arrow.png"
                            style="    width: 40px;" alt="">
                        </button>
                      </div>
                    </template>
                    <template #dots="{ total, currentIndex, to }">
                      <div class="custom-dots flex items-center justify-center" style="
                      position: absolute;
                      bottom: 20px;
                      left: 0px;
                      width: 100%;
                    ">
                        <ul class="custom-dots" style="
                          display: flex;
                          margin: 0;
                          padding: 0;
                      ">
                          <li v-for="index of total" :key="index" :style="{
                            backgroundColor: currentIndex === (index - 1) ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
                          }" style="display: inline-block;
                          width: 12px;
                          height: 4px;
                          margin: 0 3px;
                          border-radius: 4px;
                          transition: width 0.3s, background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                          cursor: pointer;
                        " @click="to(index - 1)" />
                        </ul>
                      </div>
                    </template>
                  </NCarousel>
                  <!-- <van-swipe>
                  <van-swipe-item v-for="(item, i) of tabList" :key="i">
                    <img :src="item.iconUrl" alt="" style="width: 100%;border-radius: 10px;" @click="handleDump(item)">
                  </van-swipe-item>

                </van-swipe> -->
                </div>
              </div>
              <div v-if="dataSources.length" id="data-wrapper">
                <Message v-for="(item, index) of dataSources" :key="index" :date-time="item.timestamp" :text="item.text"
                  :info="item"
                  :is-show="(dataSources.length - 1 == index) && (userStore.currentApp && userStore.currentApp.system === 1)"
                  :is-end="dataSources.length - 1 == index" :ask-msg="item.ast" :inversion="item.inversion"
                  :error="item.error" :loading="item.loading" :view-msg="item.mossReduceInfo?.viewMsg"
                  :question-mode="item.mossReduceInfo?.questionMode" @ask="(...args) => askFn(...args, index)"
                  @online="onlineFn" @jarvis="jarvisFn" @report="reportCallback" />

                <div class="respondingBtn sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    正在响应
                  </NButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer :class="footerClass">
          <transition name="fade1">
            <Footer />
          </transition>
          <div v-show="!hidden" class="w-full m-auto p-2" style="">
            <div class="moss-btns flex justify-between space-x-2 w-full">
              <NInput v-if="!prompt || prompt[0] !== '/'" ref="NInputRef" v-model:value="prompt"
                class="step1 input !bg-[#ffffff] dark:!bg-[#3A3A3C] " :bordered="false" autofocus type="textarea"
                :autosize="{ minRows: 3, maxRows: 5 }" :placeholder="placeholder" style="" @keydown="handleEnter" />
              <NSelect v-if="prompt && prompt[0] === '/'" ref="NSelectRef" v-model:value="prompt" filterable :show="true"
                :autofocus="true" :autosize="{ minRows: 3, maxRows: 3 }" placeholder="placeholder" :options="selectOption"
                label-field="key" @keydown="handleEnter" @input="handleSelectInput" />
              <!-- MOSS字数 -->

              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: absolute;
                bottom: 10px;
                box-sizing: border-box;
                margin: 0;
                right: 0;
              ">
                <div>
                  <!-- 左边按钮 -->
                </div>
                <div class="flex items-center">
                  <div style="transform: scale(0.9);"
                    class="btn-mode text-center dark:bg-[#6051FF] dark:text-[#FFFFFF] bg-[#6F22FE] text-[#fff]"
                    @click="handleMode">
                    {{ userStore.toggleValue ? '正常模式' : '极简模式' }}
                  </div>

                  <NButton id="ask-question" strong secondary circle
                    style="background-color: transparent;color: var(--moss-text-ask-color);" type="primary"
                    :disabled="buttonDisabled" @click="handleSubmit">
                    <template #icon>
                      <span class="">
                        <SvgIcon icon="ri:send-plane-fill" />
                      </span>
                    </template>
                  </NButton>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>

    <div v-if="userStore.userInfo.user && !userStore.userInfo.user.authed" class="text-center">
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
.icon-top {
  border-radius: 50%;
  overflow: hidden;
  position: fixed;
  z-index: 100;
  background-color: var(--moss-bg-reply-color);
  // color: var(--moss-text-reply-color);
  right: 30px;
  bottom: 200px;
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0.9;

  &:hover {
    // background-color: #00000040;
    opacity: 1;
  }
}

.guideMsg {
  text-align: left;
  display: inline-block;
  border-radius: 60px;
  margin-top: 10px;
  background-color: var(--moss-bg-reply-color);
  color: var(--moss-text-time-color);
  padding: 4px 10px;
}

.chat-main {
  transition: all 0.2s;
  // background-color: var(--moss-bg-content-color);
}

.p90 {
  padding-top: 86px;
}

.no-data-info {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;

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
    // text-align: center;
    font-size: 14px;
    color: var(--moss-text-time-color);
    // position: absolute;
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
  border-radius: 10px;
}

.input {
  border: 0px;
  box-shadow: 0px 2px 7px 0px rgba(231, 232, 241, 1);
  border-radius: 17px;
}

.dark {
  .input {
    box-shadow: 0px 2px 7px 0px rgba(19, 19, 19, 1);
  }
}

#scrollRef1 {

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    border-radius: 10px;

    /**/
  }

  &::-webkit-scrollbar-track {
    border-radius: 10px;
    // background-color: #2c2c2c;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    border-radius: 10px;
  }
}

.dark {
  #scrollRef1 {
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }
  }
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
  opacity: .6;
  // background-color: var(--moss-bg-ask-color);
  border-radius: 3px;
  // color: var(--moss-text-ask-color);
  padding: 1px 0px;
  font-size: 12px;
  cursor: pointer;
  // display: block;
  left: 0px;
  width: 60px;
  line-height: 26px;

  &:hover {
    opacity: 1;
  }
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

.respondingBtn {
  .n-button {
    background-color: #6388FF !important;
    // border: 1px solid #6388FF !important;
    color: #fff !important;
  }
}

.plugin-btn {
  transform: scale(0.9);
  opacity: .5;

  &:hover {
    opacity: 1;
  }
}
</style>
