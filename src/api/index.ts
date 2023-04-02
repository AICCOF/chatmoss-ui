import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { getToken } from '@/store/modules/auth/helper'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: {}
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  },
) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:80/api/chat-process?version=v1.5',
    data: {
      prompt: params.prompt,
      options: {},
      apiKey: localStorage.getItem('SECRET_TOKEN') ? localStorage.getItem('apiKey') : '',
    },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return new Promise((resolve, rejects) => {
    resolve({
      auth: !!getToken(),
    })
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/verify',
    data: { token },
  })
}

export function register<T>(data: {
  email: String
  password: String
  nickname: String
}) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/user/register',
    data,
  })
}
export function networkSearch<T = any>(
  params: {
    search: string
  },
) {
  return post<T>({
    url: `http://chatmoss.aihao123.cn:5656/luomacode-node/search?search=${params.search}`,
  })
}
export function login<T>(data: {
  email: string
  password: string
  nickname?: string
}) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/user/login',
    data,
  })
}
export function emailCode<T>(data: {
  email: String
  password: String
  nickname: String
}) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/user/emailCode',
    data,
  })
}
// 重置密码-邮箱验证码
export function forgetPwdEmailCode<T>(data: {
  email: String
}) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/user/forgetPwdEmailCode',
    data,
  })
}
// 重置密码
export function resetPwd<T>(data: {
  email: string
  password: string
  emailCode: string
}) {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/user/resetPwd',
    data,
  })
}

export function residueCount<T>() {
  return post<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/chat/getUserInfo',
    data: {},
  })
}
