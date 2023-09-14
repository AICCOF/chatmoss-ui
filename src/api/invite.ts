import post, { deleteRequest, get } from '@/utils/request'

import { getToken } from '@/store/modules/auth/helper'

export interface InviteRes {
  "40TotalDays": number
  "inviteCode": string
  "40Times": number
  "35Times": number
  "35TotalDays": number
}

export function getInviteInfo<T>() {
  return get<T>({
    url: `/luomacode-api/invite/info`,
    data: {},
  })
}


export function trace<T>(data) {
  if (getToken()){
    return post<T>({
      url: `/luomacode-api/trace`,
      data,
    })
  }

  return Promise.reject('未登录')
  
}
