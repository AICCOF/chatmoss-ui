import post, { deleteRequest, get } from '@/utils/request'

let domain = 'http://chatmoss.aihao123.cn:3002'
if (import.meta.env.DEV)
  domain = ''

export function getSystemNotice<T>() {
  return get<T>({
    url: `${domain}/luomacode-api/user/system/notice`,
    data: {},
  })
}

export function getPlusInfo<T>() {
  return get<T>({
    url: 'http://chatmoss.aihao123.cn:3002/luomacode-api/score',
    data: {},
  })
}

export function getWithScore<T>(data: any) {
  return post<T>({
    url: `${domain}/luomacode-api/plus/withScore`,
    data,
  })
}

export function getKeyList<T>() {
  return get<T>({
    url: `${domain}/luomacode-api/key/list`,
    data: {},
  })
}

export function saveKey<T>(data: any) {
  return post<T>({
    url: `${domain}/luomacode-api/key`,
    data,
  })
}

export function deleteKey<T>(key: string) {
  return deleteRequest<T>({
    url: `${domain}/luomacode-api/key/${key}`,
    data: {},
  })
}
