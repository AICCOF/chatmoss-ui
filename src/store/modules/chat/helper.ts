import { ss } from '@/utils/storage'
import { sendToMsg } from '@/utils/vsCodeUtils'

const LOCAL_NAME = 'chatStorage'


  

export function defaultState(): Chat.ChatState {
  const uuid = 80
  return { active: uuid, history: [{ uuid, title: '新建问题', isEdit: false }], chat: [{ uuid, data: [] }] }
}

export function getLocalState(): Chat.ChatState {
 
  return ss.get(LOCAL_NAME) ?? defaultState()
  
}

export function setLocalState(state: Chat.ChatState) {
  sendToMsg('chatStorage',JSON.stringify(state))
  ss.set(LOCAL_NAME, state)
}
