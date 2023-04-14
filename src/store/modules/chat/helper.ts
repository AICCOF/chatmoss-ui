import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'
let vscode: any = null

if (typeof acquireVsCodeApi !== 'undefined')
  vscode = acquireVsCodeApi()

export function defaultState(): Chat.ChatState {
  const uuid = 80
  return { active: uuid, history: [{ uuid, title: '新建问题', isEdit: false }], chat: [{ uuid, data: [] }] }
}

export function getLocalState(): Chat.ChatState {
//  let localState
//  try {
//    let value = JSON.parse(window.chatStorage)
//     localState = value
//  } catch (error) {
//     localState =  ss.get(LOCAL_NAME)
//  } finally {
//    return localState ?? defaultState()
//  }
  return ss.get(LOCAL_NAME) ?? defaultState()
  
}

export function setLocalState(state: Chat.ChatState) {
  if (vscode) {
    vscode.postMessage({
      type: 'chatStorage',
      value: JSON.stringify(state),
    })
  }
  ss.set(LOCAL_NAME, state)
}
