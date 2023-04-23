import { defineStore } from 'pinia'
import { getLocalState, setLocalState } from './helper'
import { addConversation, deleteConversation, editConversation, getConversationDetail, getConversationList } from '@/api/conversation'


export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => getLocalState(),
  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },
    getUuid(state: Chat.ChatState){
      return state.active as any
    },

    getChatByUuid(state: Chat.ChatState) {
      return () => {
        return (state.chat.find(item => item.id === state.active)?.data ?? []).sort((a, b) => a.timestamp - b.timestamp)
      }
    },
  },

  actions: {
    async addHistory() {
      // this.history.unshift(history)
      // this.chat.unshift({ uuid: history.uuid, data: chatData })
      // this.active = history.uuid

      let res = await addConversation({ title: '新建问题' })
      this.active = res.msg as number;
      this.historyList();
      this.reloadRoute(this.active)

    },
    async historyList() {
      let res = await getConversationList()
      this.getConversationDetail();
      this.history = res.list;
      this.chat = res.list;
    
    },
    async getConversationDetail() {
      let res = await getConversationDetail({ conversationId: this.active,pageSize:100 })
     
     let result =  this.chat.find(item => item.id === this.active)

     if (!result.data) result.data = [];
     result?.data.push(...res.rows.map((row)=>{
      return {
        ...row,
        inversion: !!row.content.startsWith('0:'),
        text: row.content.slice(2)
      }
     }))

     console.log(result?.data)


      // this.chat.push(...res.rows)
      // this.history = res.list;

    },
    updateStore(chat: Chat.ChatState) {
      this.history = chat.history
      this.active = chat.active;
      this.chat = chat.chat
    },

    async updateHistory(uuid: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.id === uuid)
      console.log(edit, index)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        if (edit.isEdit) {
          this.history[index].title = this.history[index].tem
        } else {
          if (this.history[index].title !== this.history[index].tem) {
            await editConversation({ title: this.history[index].tem, conversationId: this.history[index].id })
            await this.historyList()
          }
        }
        this.recordState()
      }
    },

    async deleteHistory(index: number) {

      await deleteConversation({ "conversationId": this.history[index].id })
      await this.historyList()

      const id = this.history[this.history.length - 1].id

      this.active = id
      this.reloadRoute(id)
    },

    async setActive(uuid: number) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    getChatByUuidAndIndex(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },

    addChatByUuid(uuid: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.history.length === 0) {
          // const uuid = Date.now()
          // this.history.push({ id: uuid ,uuid, title: chat.text, isEdit: false })
          // this.chat.push({ id: uuid, uuid, data: [chat] })
          // this.active = uuid
          // this.recordState()
        }
        else {
          
          this.chat[0].data.push(chat)
          if (this.history[0].title === '新建问题')
            this.history[0].title = chat.text
          this.recordState()
        }
      }

      const index = this.chat.findIndex(item => item.id === uuid)
      if (index !== -1) {
        if (!this.chat[index].data) this.chat[index].data = [];
        this.chat[index].data.push(chat)
        console.log(this.chat[index].data)
        if (this.history[index].title === '新建问题')
          this.history[index].title = chat.text
        this.recordState()
      }
    },

    updateChatByUuid(uuid: number, index: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.id === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(uuid: number, index: number, chat: Partial<Chat.Chat>) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },

    deleteChatByUuid(uuid: number, index: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data.splice(index, 1)
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.id === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data.splice(index, 1)
        this.recordState()
      }
    },

    clearChatByUuid(uuid: number) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          this.chat[0].data = []
          this.recordState()
        }
        return
      }

      const index = this.chat.findIndex(item => item.id === uuid)
      if (index !== -1) {
        this.chat[index].data = []
        this.recordState()
      }
    },

    async reloadRoute(uuid?: number) {
      this.recordState()
      // await router.push({ name: 'Chat', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
