
import { localStorage } from "@/utils/storage/localStorage";
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
let record: Record<string, Function> = {};
window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.type) {
    case 'selectedText':
      if (message.value) {
        localStorage.setItem('selectedText', message.value)
        record.handleVscodeMessage && record.handleVscodeMessage(message.value)
      }
      break
    case 'chatMossToken':
      if (message.value) {
        record.handleToke && record.handleToken(JSON.parse(message.value))
      }
      break
    default:
      break
  }
})
export default function vsCodeUtils(rec:Record<string,Function>) {
  record = Object.assign(record,rec)
}


