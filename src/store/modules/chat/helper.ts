import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'


export function defaultState(): Chat.ChatState {
  return { active: null, chat: [], localChat:[],searchMsg:'' }
}

export function getLocalState(): Chat.ChatState {

  if (ss.get(LOCAL_NAME)){
    return {
      localChat:[],
      ...ss.get(LOCAL_NAME) 
    }
  }else{
    return  defaultState()
  }
  

}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}
