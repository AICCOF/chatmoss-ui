import { getToken } from '@/store/modules/auth/helper'
import post, { deleteRequest, get } from '@/utils/request'



export interface InviteRes {
  "40TotalDays": number
  "inviteCode": string
  "40Times": number
  "35Times": number
  "35TotalDays": number
}

export function getWechatLoginQrCode<T>(data) {
  return post<T>({
    url: `/luomacode-api/user/getWechatLoginQrCode`,
    data,
  })
}

export function getTokenByTicket<T>(data) {
  return get<T>({
    url: `/luomacode-api/user/getTokenByTicket`,
    data,
  })
}
export function bindingStatus<T>(data = {}) {
  if(getToken()){
    return get<T>({
      url: `/luomacode-api/binding/status`,
      data,
    })
  }else{
    return Promise.reject()
  }
}

export function bandingEmailCode<T>(data = {}) {
  return post<T>({
    url: `/luomacode-api/user/bandingEmailCode`,
    data,
  })
}

export function doBindingEmail<T>(data = {}) {
  return post<T>({
    url: `/luomacode-api/user/doBindingEmail`,
    data,
  })
}
export function getBindingWechatQrCode<T>(data = {}) {
  return post<T>({
    url: `/luomacode-api/binding/getBindingWechatQrCode`,
    data,
  })
}
export function unbind<T>(data = {}) {
  return post<T>({
    url: `/luomacode-api/binding/unbind`,
    data,
  })
}
export function getModelList<T>(data = {}) {
  return get<T>({
    url: `/luomacode-api/outer/model/list`,
    data,
  })
}

export function getBalanceInfo<T>(data = {}) {
  return get<T>({
    url: `/luomacode-api/user/getBalanceInfo`,
    data,
  })
}



