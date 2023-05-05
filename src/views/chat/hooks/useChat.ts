import { useChatStore } from '@/store'

export function useChat() {
  const chatStore = useChatStore()

  const getChatByUuidAndIndex = (id: number, index: number) => {
    return chatStore.getChatByUuidAndIndex(id, index)
  }

  const addChat = (id: number, chat: Chat.Chat) => {
    return chatStore.addChatByUuid(id, chat)
  }

  const updateChat = (id: number, index: number, chat: Chat.Chat) => {
    chatStore.updateChatByUuid(id, index, chat)
  }

  const updateChatSome = (id: number, index: number, chat: Partial<Chat.Chat>) => {
    chatStore.updateChatSomeByUuid(id, index, chat)
  }

  return {
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
  }
}
