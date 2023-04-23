import { ss } from '@/utils/storage'
import { sendToMsg } from '@/utils/vsCodeUtils'

const LOCAL_NAME = 'chatStorage'


export function defaultState(): Chat.ChatState {
  return { active: 0, history: [], chat: [] }
}

export function getLocalState(): Chat.ChatState {
 
  return ss.get(LOCAL_NAME) ?? defaultState()
  
}

export function setLocalState(state: Chat.ChatState) {
  sendToMsg('chatStorage',state)
  ss.set(LOCAL_NAME, state)
}
