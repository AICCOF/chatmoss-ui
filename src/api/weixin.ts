import post, { deleteRequest, get } from '@/utils/request'



export interface InviteRes {
  "40TotalDays": number
  "inviteCode": string
  "40Times": number
  "35Times": number
  "35TotalDays": number
}

export function getWechatLoginQrCode<T>() {
  return post<T>({
    url: `/luomacode-api/user/getWechatLoginQrCode`,
    data: {
      inviteCode:''
    },
  })
}

export function getTokenByTicket<T>(data) {
  return get<T>({
    url: `/luomacode-api/user/getTokenByTicket`,
    data,
  })
}
export function bindingStatus<T>(data = {}) {
  return get<T>({
    url: `/luomacode-api/binding/status`,
    data,
  })
}

export function bandingEmailCode<T>(data = {}) {
  return post<T>({
    url: `/luomacode-api/user/bandingEmailCode`,
    data,
  })
}

export function doBindingEmail<T>(data = {}) {
  return get<T>({
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
