import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'
let vscode:any = null;

if (typeof acquireVsCodeApi !== 'undefined') {
   vscode = acquireVsCodeApi();
 
}
export function defaultState(): Chat.ChatState {
  const uuid = 80
  return { active: uuid, history: [{ uuid, title: '新建问题', isEdit: false }], chat: [{ uuid, data: [] }] }
}

export function getLocalState(): Chat.ChatState {
  const localState = window.chatStorage ?? ss.get(LOCAL_NAME)
  return localState ?? defaultState()
}

export function setLocalState(state: Chat.ChatState) {

  if (vscode){
    vscode.postMessage({
      type: "chatStorage",
      value: JSON.stringify(state),
    });
  }
  console.log(state)
  ss.set(LOCAL_NAME, state)
}
