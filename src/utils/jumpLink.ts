import { useGo } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
export function jumpLink(json, router) {
  // console.log(111,router)
  const go = useGo(router)
  if (json.type === 'path') {
    go({
      name: json.info.path
    })
  } else if (json.type === 'web') {
    if (json.info.type === 'openLink') {
      // win
      let dom = json.info.url
      dom = replaceDom(dom)
      let url = `${dom}?token=${getToken()}&time=${new Date().getTime()}`
      window.open(url, '_blank')
    } else {
      go({
        name: 'h5',
        query: json.info
      })
    }
  }
}

export function replaceDom(dom) {
  if (location.origin == 'http://localhost') {
    return dom.replace('http://h5.aihao123.cn', 'http://127.0.0.1:5173')
  }else{
    return dom
  }
}