
import {useChatStore } from '@/store'
import { setLocalState } from '@/store/modules/chat/helper'
let vscode: any = null

if (typeof acquireVsCodeApi !== 'undefined') {

  vscode = acquireVsCodeApi()
  vscode.postMessage({
    type: 'pageOver',
  })
}

export function sendToMsg(type:string,state:any){
  if (vscode) {
    vscode.postMessage({
      type: type,
      value: JSON.stringify(state),
    })
  }
}

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
        // console.log(message)
        if (message.value) {
          // console.log(record)
          record && record.handleVscodeMessage(message.value)
        }
        break
      case 'chatMossToken':
        // console.log(message)
        if (message.value) {
          // console.log(record)
          record && record.handleToken(message.value)
        }
        break
      default:
        break
    }
  })


  
}
