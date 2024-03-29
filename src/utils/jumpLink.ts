import { useGo } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
export function jumpLink(json, router) {
  // console.log(111,router)
  const go = useGo(router)
  if (json.type === 'path') {
    go({
      name: json.info.path,
    })
  }
  else if (json.type === 'web') {
    if (json.info.type === 'openLink') {
      // win
      let dom = json.info.url
      dom = replaceDom(dom)
      const url = `${dom}?token=${getToken()}&time=${new Date().getTime()}`
      openWebView(url)
    }
    else {
      go({
        name: 'h5',
        query: json.info,
      })
    }
  }
}

export function openWebView(url) {
  // window.open(url, '_blank')

  const dom = document.createElement('a')
  dom.href = url
  dom.target = '_blank'
  dom.style.display = 'none'

  document.body.appendChild(dom)
  dom.click()

  setTimeout(() => {
    document.body.removeChild(dom)
  }, 3000)
}

export function replaceDom(dom) {
  // 打包境外软件使用
  dom = dom.replace('http://h5.aihao123.cn', 'https://h5.aihao123.cn')
  if (location.origin == 'http://localhost') {
    dom = dom.replace('https://h5.aihao123.cn', 'http://127.0.0.1:5173')
    return dom.replace('http://h5.aihao123.cn', 'http://127.0.0.1:5173')
  }
  else {
    return dom
  }
}
