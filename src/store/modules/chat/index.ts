import { defineStore } from 'pinia'
import { createDiscreteApi } from 'naive-ui'
import { getLocalState, setLocalState } from './helper'
import { addConversation, deleteConversation, editConversation, getConversationDetail, getConversationList } from '@/api/conversation'
import { getToken } from '../auth/helper'
const { message } = createDiscreteApi(
  ['message', 'dialog', 'notification', 'loadingBar'],
  {},
)

let flag = 'MOSS_';

export function verify(id: any) {
  return `${id}`.indexOf(flag) > - 1
}
export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => {
    return {
      ...getLocalState(),
      chat: [],
    }
  },
  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.chat.findIndex(item => item.id === state.active)
      if (index !== -1)
        return state.chat[index]
      return null
    },
    getUuid(state: Chat.ChatState) {
      return state.active as any
    },
    chatsCollect() {
      let chat: Chat.ChatInfo[] = this.chat;
      let localChat: Chat.ChatInfo[] = this.localChat;
      return [...chat, ...localChat]
    },

    getChatByUuid(state: Chat.ChatState) {
      return () => {
        let active = state.active as any;

        if (!active) return []
        if (verify(state.active)) {
          return (state.localChat.find(item => item.id === state.active)?.data ?? [])
        } else {
          return (state.chat.find(item => item.id === state.active)?.data ?? []).sort((a, b) => a.timestamp - b.timestamp)
        }
      }
    },
  },

  actions: {
    async createChat(title?: string) {
      let token = getToken()
      if (token) {
        await this.createOriginChat(title);
      } else {
        await this.createLocalChat(title);
      }
    },
    async createOriginChat(title?: string) {
      try {
        const res = await addConversation({ title: title || '新建问题' })
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
      let timestamp = new Date().getTime()
      let id = "MOSS_" + timestamp;
      this.localChat.unshift({
        timestamp,
        id,
        "title": title || "新建问题",
        isEdit: false,
        data: []
      })
      this.active = id
      this.reloadRoute()
    },
    async chatList() {
      const res = await getConversationList()
      this.chat = res.list
      this.getConversationDetail()
      // 没有选中某一项的处理逻辑
      // setTimeout(() => {
      //   const questionListDom = document.querySelector('.question-list') as HTMLDivElement
      //   const questionBtnDom = document.querySelector('#question-btn') as HTMLDivElement
      //   if (!localStorage.getItem('chatStorage')) {
      //     questionListDom
      //       ? questionListDom.click() // 如果有数据，但是没有选中，就先操作dom节点选中第一个
      //       : questionBtnDom.click() // 如果没有数据，就先操作dom节点，新建一个问题
      //   }
      // }, 500)
    },
    clearList() {
      this.chat = []
      // this.localChat = [];
      this.active = null
    },
    async getConversationDetail() {
      if (!this.active)
        return
      const result = this.chat.find(item => item.id === this.active)
      if (result && !result.data) {
        result.data = []
        const res = await getConversationDetail({ conversationId: this.active, pageSize: 100 })
        result.data.push(...res.rows.map((row: any) => {
          return {
            ...row,
            inversion: !!row.content.startsWith('0:'),
            text: row.content.slice(2),
          }
        }))
      }
    },

    async updateHistory(id: any, edit: Partial<Chat.ChatInfo>) {

      let token = getToken()
      if (token && !verify(id)) {
        await this.updateOriginHistory(id, edit);
      } else {
        await this.updateLocalHistory(id, edit);
      }
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

    async deleteHistory(index: number) {
      let token = getToken()
      if (token && !verify(this.active)) {
        await this.deleteOriginHistory(index);
      } else {
        await this.deleteLocalHistory(index);
      }
    },
    async deleteOriginHistory(index: number) {
      await deleteConversation({ conversationId: this.chat[index].id })
      await this.chatList()

      const chat = this.chat[this.chat.length - 1]
      if (!chat)
        this.active = null

      else
        this.active = chat.id
      this.reloadRoute()
    },
    async deleteLocalHistory(index: number) {

      this.localChat.splice(index, 1)
      const chat = this.localChat[this.localChat.length - 1]
      if (!chat)
        this.active = null
      else
        this.active = chat.id
      this.reloadRoute()
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
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },

    async addChatByUuid(id: number, chat: Chat.Chat) {
      let token = getToken()
      if (token && !verify(this.active)) {
        await this.addOriginChat(id, chat);
      } else {
        await this.addLocalChat(id, chat);
      }
    },
    async addLocalChat(id: number, chat: Chat.Chat) {
      if (!id || id === 0) {
        if (this.localChat.length === 0)
          await this.createLocalChat(chat.text)
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
      } else {
        //  兼容没有找到会话id的情况
        this.addLocalChat(0, chat);

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
      } else {
        this.addLocalChat(0, chat);
      }
    },

    async updateChatByUuid(id: number, index: number, chat: Chat.Chat) {
      let token = getToken()
      if (token && !verify(this.active)) {
        await this.updateOriginChatByUuid(id, index, chat);
      } else {
        await this.updateLocalChatByUuid(id, index, chat);
      }
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
      if (!id || id === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.id === id)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
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
