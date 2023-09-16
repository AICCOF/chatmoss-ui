import post, { deleteRequest, get } from '@/utils/request'



export function getSystemNotice<T>(data) {
  return get<T>({
    url: `/luomacode-api/announcement/newest`,
    data,
  })
}
export function getRedCount<T>(data) {
  return get<T>({
    url: `/luomacode-api/red/count`,
    data: data,
  })
}

export function getPlusInfo<T>() {
  return get<T>({
    url: '/luomacode-api/score',
    data: {},
  })
}

export function getWithScore<T>(data: any) {
  return post<T>({
    url: `/luomacode-api/plus/withScore`,
    data,
  })
}

export function getKeyList<T>() {
  return get<T>({
    url: `/luomacode-api/key/list`,
    data: {},
  })
}

export function saveKey<T>(data: any) {
  return post<T>({
    url: `/luomacode-api/key`,
    data,
  })
}

export function deleteKey<T>(key: string) {
  return deleteRequest<T>({
    url: `/luomacode-api/key/${key}`,
    data: {},
  })
}

export function sendFeedback<T>(data: any) {
  return post<T>({
    url: `/luomacode-api/feedback`,
    data,
  })
}

export function exchange<T>(data: Record<string,String>) {
  return post<T>({
    url: `/luomacode-api/redeem/toTimes`,
    data,
  })
}
