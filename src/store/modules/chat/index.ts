import { defineStore } from 'pinia'
import { getLocalState, setLocalState } from './helper'
import { addConversation, deleteConversation, editConversation, getConversationDetail, getConversationList } from '@/api/conversation'


export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => {
    return {
      ...getLocalState(),
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

    getChatByUuid(state: Chat.ChatState) {
      return () => {
        return (state.chat.find(item => item.id === state.active)?.data ?? []).sort((a, b) => a.timestamp - b.timestamp)
      }
    },
  },

  actions: {
    async addHistory(title:string) {
      let res = await addConversation({ title: title || '新建问题' })
      this.active = res.msg as number;
      this.chat.unshift(res.list[0]);
      this.reloadRoute()

    },
    async historyList() {
      if (!this.active) return;
      let res = await getConversationList()
      this.chat = res.list;
      this.getConversationDetail();
    
    },
    async getConversationDetail() {

      if (!this.active) return;
      let result = this.chat.find(item => item.id === this.active)
      if (result && !result.data) {
        result.data = [];
        let res = await getConversationDetail({ conversationId: this.active, pageSize: 100 })
        result.data.push(...res.rows.map((row: any) => {
          return {
            ...row,
            inversion: !!row.content.startsWith('0:'),
            text: row.content.slice(2)
          }
        }))   
      }
     
    },
    
    async updateHistory(id: number, edit: Partial<Chat.ChatInfo>) {
      const index = this.chat.findIndex(item => item.id === id)
      if (index !== -1) {
        this.chat[index] = { ...this.chat[index], ...edit }
        if (edit.isEdit) {
          this.chat[index].title = this.chat[index].tem as string
        } else {
         
          if (this.chat[index].tem !== undefined && this.chat[index].title !== this.chat[index].tem) {
            await editConversation({ title: this.chat[index].tem, conversationId: this.chat[index].id })
          }
          await this.getConversationDetail()
        }
        this.recordState()
      }
    },

    async deleteHistory(index: number) {

      await deleteConversation({ "conversationId": this.chat[index].id })
      await this.historyList()

      const chat = this.chat[this.chat.length - 1];
      if (!history) {
        this.active = null
      } else {
        this.active = chat.id
      }
      this.reloadRoute()
    },

    async setActive(id: number) {
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
      if (!id || id === 0) {
        if (this.chat.length === 0) {
          await this.addHistory(chat.text);
        }
      }
      let result = this.chat.find(item => item.id === id)
      if (result) {
        if (!result.data) result.data = [];
        result.data.push(chat)
        this.recordState()
      }
    },

    updateChatByUuid(id: number, index: number, chat: Chat.Chat) {
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
