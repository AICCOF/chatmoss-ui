import type { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from 'axios'
import request from './axios'
import { useAuthStore } from '@/store'
import { showToast } from 'vant';
import { useUserStore } from '@/store'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
export interface HttpOption {
  url: string
  data?: any
  method?: string
  headers?: any
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  signal?: GenericAbortSignal
  beforeRequest?: () => void
  afterRequest?: () => void
}

export interface Response<T = any> {
  data: T
  code: number;
  message: string | null
  status: string
  [propName: string]: any;
}

function http<T = any>(
  { url, data, method, headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()
    // 代表是二进制，文本
    if (typeof res.data !== 'object') {
      return Promise.resolve(res.data)
    }
    if ([0, 200].includes(res.data.code)) {
      return Promise.resolve(res.data)
    }
    if (res.data.status === 'Unauthorized') {
      authStore.removeToken()
      window.location.reload()
    }
    if ([204].includes(res.data.code)) {
      const useAuthStore = useAuthStoreWithout()
      const userStore = useUserStore()
      const chatStore = useChatStore()
      useAuthStore.setToken('')
      sendToMsg('chatMossToken', '')
      chatStore.clearList()
      userStore.residueCountAPI()
      userStore.getBalanceInfo()
      showToast({
        message: '登录已过期，请重新登录',
        position: 'top',
        duration: 6000
      })
      Promise.reject(res.data)
    } else {
      showToast(res.data.msg)
    }
    return Promise.reject(res.data)
  }

  const failHandler = (error: Response<Error>) => {
    let res = error.response.data;
    if (res.code !== 0) {
      showToast(res.msg)
    }
    
    afterRequest?.()
    throw new Error(error?.message || 'Error')
  }

  beforeRequest?.()

  method = method || 'GET'

  const params = Object.assign(typeof data === 'function' ? data() : data ?? {}, {})

  return method === 'GET'
    ? request.get(url, { params, signal, onDownloadProgress }).then(successHandler, failHandler)
    : request.post(url, params, { headers, signal, onDownloadProgress }).then(successHandler, failHandler)


    
}

export function get<T = any>(
  { url, data, method = 'GET', onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}
export function deleteRequest<T = any>(
  { url, data, method = 'DELETE', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return request.delete(url, data)
}

export function post<T = any>(
  { url, data, method = 'POST', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return http<T>({
    url,
    method,
    data,
    headers,
    onDownloadProgress,
    signal,
    beforeRequest,
    afterRequest,
  })
}

export function put<T = any>(
  { url, data, method = 'PUT', headers, onDownloadProgress, signal, beforeRequest, afterRequest }: HttpOption,
): Promise<Response<T>> {
  return request.put(url, data)
}
export default post


export function Request<T = any>(
  option: HttpOption,
) {
  const successHandler = (res: AxiosResponse<Response<T>>) => {
    const authStore = useAuthStore()
    // 代表是二进制，文本
    if (typeof res.data !== 'object') {
      return Promise.resolve(res.data)
    }
    if ([0, 200].includes(res.data.code)) {
      return Promise.resolve(res.data)
    }
    if (res.data.status === 'Unauthorized') {
      authStore.removeToken()
      window.location.reload()
    }
    if ([204].includes(res.data.code)) {
      const useAuthStore = useAuthStoreWithout()
      const userStore = useUserStore()
      const chatStore = useChatStore()
      useAuthStore.setToken('')
      sendToMsg('chatMossToken', '')
      chatStore.clearList()
      userStore.residueCountAPI()
      userStore.getBalanceInfo()
      showToast({
        message: '登录已过期，请重新登录',
        position: 'top',
        duration: 6000
      })
      Promise.reject(res)
    } else {
      showToast(res.data.msg)
    }
    return Promise.reject(res)
  }

  const failHandler = (error: Response<Error>) => {
    let res = error.response.data;
    if (res.code !== 0) {
      showToast(res.msg)
    }

    afterRequest?.()
    throw new Error(error?.message || 'Error')
  }



  return request(option).then(successHandler).catch(failHandler)
}
