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

export function getTokenByTicket<T>() {
  return get<T>({
    url: `/luomacode-api/user/getTokenByTicket`,
    data: {},
  })
}