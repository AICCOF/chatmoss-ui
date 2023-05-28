import axios, { type AxiosResponse } from 'axios'
import { useAuthStoreWithout } from '@/store/modules'
import { getDomain } from '@/api/getDomain'

const service = axios.create({
  baseURL: '',
})

service.interceptors.request.use(
  (config) => {
    const token = useAuthStoreWithout().token
    if (token)
      config.headers.token = token

    // 处理 url
    const doMain  = getDomain();
    config.url = config.url && config.url.indexOf('http')>-1 ?config.url:doMain + config.url;
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
