import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'


export function defaultState(): Chat.ChatState {
  return { active: null, chat: [], localChat:[] }
}

export function getLocalState(): Chat.ChatState {

  return ss.get(LOCAL_NAME) ?? defaultState()

}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}
