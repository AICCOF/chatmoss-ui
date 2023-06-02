import post, { deleteRequest, get } from '@/utils/request'



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
