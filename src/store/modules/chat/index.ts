import { defineStore } from 'pinia'
import { createDiscreteApi } from 'naive-ui'
import dayjs from 'dayjs'
import { getToken } from '../auth/helper'
import { getLocalState, setLocalState } from './helper'
import { addConversation, deleteBatchConversation, deleteConversation, editConversation, getConversationDetail, getConversationList } from '@/api/conversation'
import { useUserStore } from '@/store'
import { getPlugin } from '@/api/plugin'

const { message } = createDiscreteApi(
  ['message', 'dialog', 'notification', 'loadingBar'],
  {},
)

const flag = 'MOSS_'

export function verify(id: any) {
  return `${id}`.includes(flag)
}
export const useChatStore = defineStore('chat-store', {
  state: () => {
    return {
      pluginList: [],
      currentPlugin: {},
      plugState: 0,
      ...getLocalState(),
      chat: [],
      searchMsg: '',
      deleteIds: [],
      loading: false,

    }
  },
  getters: {
    pluginMap() {
      const map = {}
      for (let index = 0; index < this.pluginList.length; index++) {
        const element = this.pluginList[index]
        map[element.pluginId] = element
      }
      return map
    },
    getSelectPluginInfo(state) {
      return state.currentPlugin.pluginId ? state.currentPlugin : null
    },
    textLength() {
      const dataSources = this.getChatByUuid() as any[]
      // console.log(dataSources, 'textLength')
      return Math.ceil(dataSources.map(item => item.text).join('\n').length)
    },
    isLimit() {
      // console.log(this.textLength, 'textLength')
      const leg = this.textLength as number
      return leg > 2500
    },
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.chat.findIndex(item => item.id === state.active)
      if (index !== -1)
        return state.chat[index]
      return null
    },
    getUuid(state: Chat.ChatState) {
      return state.active as any
    },
    chatsCollect(state: Chat.ChatState) {
      const chat: Chat.ChatInfo[] = this.chat
      const localChat: Chat.ChatInfo[] = this.localChat
      if (getToken())
        return [...chat.filter(row => {
          return row.title.includes(state.searchMsg) || (row.firstContent && row.firstContent.includes(state.searchMsg))
        })]

      else
        return [...localChat.filter(row => row.title.includes(state.searchMsg))]
    },
    sortTimeChat() {
      const timeList: {
        title: string
        data: Chat.ChatState[]
      }[] = [
          {
            title: '今天',
            data: [],
          },
          {
            title: '昨天',
            data: [],
          },
          {
            title: '三天前',
            data: [],
          },
          {
            title: '七天前',
            data: [],
          },
          {
            title: '一个月前',
            data: [],
          },
        ]
      this.chatsCollect.forEach((row) => {
        const timestamp = row.timestamp
        if (timestamp >= dayjs().startOf('day').valueOf())
          timeList[0].data.push(row)

        else if (
          timestamp < dayjs().startOf('day').valueOf()
          && timestamp >= dayjs().startOf('day').subtract(1, 'day').valueOf()
        )
          timeList[1].data.push(row)

        else if (
          timestamp < dayjs().startOf('day').subtract(1, 'day').valueOf()
          && timestamp >= dayjs().startOf('day').subtract(3, 'day').valueOf()
        )
          timeList[2].data.push(row)

        else if (
          timestamp < dayjs().startOf('day').subtract(3, 'day').valueOf()
          && timestamp >= dayjs().startOf('day').subtract(7, 'day').valueOf()
        )
          timeList[3].data.push(row)

        else
          timeList[4].data.push(row)
      })
      return timeList
    },

    getChatByUuid(state: Chat.ChatState) {
      return () => {
        const active = state.active as any
        if (!active)
          return []
        if (verify(state.active)) { return (state.localChat.find(item => item.id === state.active)?.data ?? []) }

        else
        // console.log(state.chat)
        {
          return (state.chat.find(item => item.id === state.active)?.data ?? []).sort((a, b) => {
            if (a.id && b.id)
              return a.id - b.id

            return a.timestamp - b.timestamp
          })
        }
      }
    },
  },

  actions: {
    async getPlugin() {
      const info = await getPlugin({})
      // console.log('pluginList', info)
      info.pluginList.map((item) => {
        if (this.currentPlugin.pluginId === item.pluginId && this.currentPlugin.select)
          item.select = true

        else
          item.select = false
      })
      this.pluginList = info.pluginList
    },
    setPlugState(value: number) {
      this.plugState = value
    },
    setPlugin(row) {
      this.currentPlugin = row
      this.recordState()
    },
    async createChat(title?: string) {
      const token = getToken()
      if (token)
        await this.createOriginChat(title)
      else
        await this.createLocalChat(title)
    },
    async createOriginChat(title?: string) {
      const userStore = useUserStore()
      try {
        const res = await addConversation({
          title: title || '新建问题',
          appId: userStore.appIdValue,
        })
        this.active = res.msg as number
        this.chat.unshift(res.list[0])
        this.reloadRoute()
      }
      catch (error: any) {
        message.error(error.msg)
      }
    },
    async createLocalChat(title?: string) {
      // this.active = []
      const timestamp = new Date().getTime()
      const id = `MOSS_${timestamp}`
      this.localChat.unshift({
        timestamp,
        id,
        title: title || '新建问题',
        isEdit: false,
        data: [],
      })
      this.active = id
      this.reloadRoute()
    },
    async chatList() {
      if (getToken()) {
        const userStore = useUserStore()
        // this.active = null
        const res = await getConversationList({
          appId: userStore.appIdValue,
        })
        this.chat = (res.list || []).map((row) => {
          // console.log(row.firstContent,'firstContent')
          return {
            ...row,
            // firstContent: row.firstContent && row.firstContent.length > 0 ? JSON.parse(row.firstContent)[0] :''
          }
        })
        // 去找id是否存在
        if (this.chat.length === 0) {
          this.active = null
        } else {
          // 去找id是否存在
          let index = this.chat.findIndex((row) => this.active === row.id)
          // console.log(index)
          this.active = index > -1 ? this.chat[index].id : this.chat[0].id
        }

        // console.log(res.list[0].id)
        this.getConversationDetail()
      }
    },
    clearList() {
      this.chat = []
      // this.localChat = [];
      if (this.localChat.length > 0)
        this.active = this.localChat[0].id

      else
        this.active = null
    },
    clearQuestionMode() {
      const userStore = useUserStore()
      // console.log(userStore.appIdValue)
      if (userStore.appIdValue !== '2')
        return

      const result = this.chat.find(item => item.id === this.active)
      if (result)
        result.data = []
    },
    async getConversationDetail() {
      if (!this.active)
        return
      const result = this.chat.find(item => item.id === this.active)
      if (result && !result.data) {
        result.data = []
        this.loading = true
        try {
          const res = await getConversationDetail({ conversationId: this.active, pageSize: 200 })
          const rows = res.rows.sort((a, b) => a.timestamp - b.timestamp)
          let preObj = {} // 处理用插件提问题的情况
          // console.log(rows)
          result.data.push(
            ...rows.map((row: any, i: number, array: any[]) => {
              if (row.contentList) {
                // row.contentList = JSON.parse(row.contentList)
                row.contentList = row.contentList.map((content) => {
                  return content.slice(2)
                })
              }

              if (row.content.startsWith('0:')) {
                // content": "0:北京市明天的天气\n|$moss{"name:":"1"}$moss|根据提供的数据，查询天气信息，并格式化输出
                // .match(/\|\$moss(.*?)\$moss\|/,'')
                const text = row.content.slice(2)
                // 尝试是不是用插件提问，如果使用插件提问，需要提取出来插件的信息，并把他存储下来，提供给下一条回答的信息。
                const matchText = text.match(/\|\$moss(.*?)\$moss\|/, '')

                let pluginInfo = [text]
                // console.log(pluginInfo[0])
                let json = {}
                if (matchText) {
                  pluginInfo = text.split(matchText[0])
                  try {
                    json = JSON.parse(matchText[1])
                  }
                  catch (error) {
                    console.error('error', error)
                  }
                }
                // let ast = array[i - 1].content.slice(2);
                preObj = {
                  ...row,
                  ast: pluginInfo[0] ?? '',
                  pluginInfo: {
                    ast: pluginInfo[0] ?? '',
                    pluginMessage: pluginInfo[1] ?? '',
                    ...json,
                  },
                  inversion: !!row.content.startsWith('0:'),
                  text: pluginInfo[0] ?? '',
                }
                return {
                  ...row,
                  ast: pluginInfo[0] ?? '',
                  pluginInfo: {
                    ast: pluginInfo[0] ?? '',
                    pluginMessage: pluginInfo[1] ?? '',
                    ...json,
                  },
                  inversion: !!row.content.startsWith('0:'),
                  text: pluginInfo[0] ?? '',
                }
              }
              // 处理回答
              if (row.content.startsWith('1:') && array[i - 1]) {
                // content": "1:北京市明天的天气\n$moss|根据提供的数据，查询天气信息，并格式化输出
                const text = row.content.slice(2)
                // console.log(preObj,'ask');
                return {
                  ...row,
                  ast: preObj.ast,
                  pluginInfo: preObj.pluginInfo,
                  inversion: !!row.content.startsWith('0:'),
                  text,
                }
              }
              else {
                const text = row.content.slice(2)
                return {
                  ast: text,
                  ...row,
                  inversion: !!row.content.startsWith('0:'),
                  text,
                }
              }
            }),
          )
        }
        catch (error) {
          console.log(error)
        }
        finally {
          this.loading = false
        }
      }
    },

    async updateHistory(id: any, edit: Partial<Chat.ChatInfo>) {
      const token = getToken()
      if (token && !verify(id))
        await this.updateOriginHistory(id, edit)

      else
        await this.updateLocalHistory(id, edit)
    },
    async updateOriginHistory(id: number, edit: Partial<Chat.ChatInfo>) {
      const index = this.chat.findIndex(item => item.id === id)
      if (index !== -1) {
        this.chat[index] = { ...this.chat[index], ...edit }
        if (edit.isEdit) {
          // 编辑的时候
          this.chat[index].tem = this.chat[index].title as string
        }
        else {
          // 点击取消按钮
          if (edit.isCancel) {
            // this.chat[index].tem = this.chat[index].title as string
            return
          }
          if (this.chat[index].tem !== undefined && this.chat[index].title !== this.chat[index].tem) {
            await editConversation({ title: this.chat[index].tem, conversationId: this.chat[index].id })
            this.chat[index].title = this.chat[index].tem as string
          }
        }
        await this.getConversationDetail()
      }
    },
    async updateLocalHistory(id: number, edit: Partial<Chat.ChatInfo>) {
      const index = this.localChat.findIndex(item => item.id === id)
      if (index !== -1) {
        this.localChat[index] = { ...this.localChat[index], ...edit }
        if (edit.isEdit) {
          this.localChat[index].title = this.localChat[index].tem as string
        }
        else {
          if (this.localChat[index].tem !== undefined && this.localChat[index].title !== this.localChat[index].tem)
            this.localChat[index].title = this.localChat[index].tem as string
        }
        this.recordState()
      }
    },

    async deleteHistory(id: number | string) {
      // 查找远程的
      const index = this.chat.findIndex(item => item.id === id)

      if (index !== -1) {
        this.deleteOriginHistory(index)
      }
      else {
        const i = this.localChat.findIndex(item => item.id === id)
        if (i !== -1)
          this.deleteLocalHistory(i)
      }
    },
    async deleteOriginHistory(index: number) {
      await deleteConversation({ conversationId: this.chat[index].id })
      await this.chatList()

      const chat = this.chat[0]
      if (!chat)
        this.active = null
      else
        this.active = chat.id

      this.reloadRoute()
    },
    async deleteLocalHistory(index: number) {
      this.localChat.splice(index, 1)
      const chat = this.localChat[0]
      if (!chat)
        this.active = null
      else
        this.active = chat.id
      this.reloadRoute()
    },
    async deleteBatchHistory() {
      // console.log(this.$state)
      const originIds = []
      const localIds = []
      this.$state.deleteIds.forEach((id) => {
        if (verify(id))
          localIds.push(id)

        else
          originIds.push(id)
      })
      if (originIds.length > 0) {
        await deleteBatchConversation({ conversationIds: originIds.join(',') })
        await this.chatList()
      }
      this.$state.deleteIds.forEach((id) => {
        const i = this.localChat.findIndex(item => item.id === id)
        if (i !== -1)
          this.deleteLocalHistory(i)
      })
      this.active = null
      this.deleteIds = []
    },
    async setActive(id: any) {
      this.active = id
      return await this.reloadRoute()
    },
    getChatByUuidAndIndex(id: number, index: number) {
      if (!id || id === 0) {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.id === id)
      // console.log(this.chat[chatIndex].data[index])
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },

    async addChatByUuid(id: number, chat: Chat.Chat) {
      const token = getToken()
      if (token && !verify(this.active))
        await this.addOriginChat(id, chat)

      else
        await this.addLocalChat(id, chat)
    },
    async addLocalChat(id: number, chat: Chat.Chat) {
      if (!id || id === 0) {
        if (this.localChat.length === 0)
          await this.createLocalChat(chat.text)

        else
          this.active = this.localChat[0].id
      }
      const result = this.localChat.find(item => item.id === this.active)
      if (result) {
        if (result.data && result.data.length == 0) {
          // 如果问的是第一个问题，编辑问题的标题
          result.title = chat.text
          result.data = []
        }
        result.data.push(chat)
        this.recordState()
      }
      else {
        //  兼容没有找到会话id的情况
        this.addLocalChat(0, chat)
      }
    },
    async addOriginChat(id: number, chat: Chat.Chat) {
      if (!id || id === 0) {
        if (this.chat.length === 0)
          await this.createOriginChat(chat.text)
      }
      const result = this.chat.find(item => item.id === this.active)
      if (result) {
        if (!result.data) {
          // 如果问的是第一个问题，编辑问题的标题
          await editConversation({ title: chat.text, conversationId: this.active })
          result.title = chat.text
          result.data = []
        }
        result.data.push(chat)
        this.recordState()
      }
      else {
        // this.addLocalChat(0, chat)
      }
    },

    async updateChatByUuid(id: number, index: number, chat: Chat.Chat) {
      const token = getToken()
      if (token && !verify(this.active))
        await this.updateOriginChatByUuid(id, index, chat)

      else
        await this.updateLocalChatByUuid(id, index, chat)
    },
    updateOriginChatByUuid(id: number, index: number, chat: Chat.Chat) {
      if (!id || id === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }
      const chatIndex = this.chat.findIndex(item => item.id === id)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },
    updateLocalChatByUuid(id: number, index: number, chat: Chat.Chat) {
      if (!id || id === 0) {
        if (this.localChat.length) {
          this.localChat[0].data[index] = chat
          this.recordState()
        }
        return
      }
      const chatIndex = this.localChat.findIndex(item => item.id === id)
      if (chatIndex !== -1) {
        this.localChat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(id: number, index: number, chat: Partial<Chat.Chat>) {
      let chatList = this.chat
      if (verify(id)) {
        // updateChatSomeByUuid
        chatList = this.localChat
      }
      if (!id || id === 0) {
        if (chatList.length) {
          chatList[0].data[index] = { ...chatList[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = chatList.findIndex(item => item.id === id)
      if (chatIndex !== -1) {
        chatList[chatIndex].data[index] = { ...chatList[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },

    async reloadRoute() {
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
