
import {useChatStore } from '@/store'
import { setLocalState } from '@/store/modules/chat/helper'

export default function vsCodeUtils(record:Record<string,Function>) {
  const chatStore = useChatStore()
  // 接受vscode的信息
  window.addEventListener('message', (event) => {
    const message = event.data
    switch (message.type) {
      case 'storeData':
        if (message.value) {
          chatStore.updateStore(JSON.parse(message.value))
          setLocalState(JSON.parse(message.value))
        }
        break
      case 'selectedText':
        if (message.value) {
          record && record.handleVscodeMessage(message.value)
        }
        break
      default:
        break
    }
  })


  
}
