import post, { deleteRequest, get, put } from '@/utils/request'



export function getConversationList<T>() {
  return get<T>({
    url: `/luomacode-api/conversation/list`,
    data: {},
  })
}


export function addConversation<T>(params: any) {
  return post<T>({
    url: `/luomacode-api/conversation`,
    data: params,
  })
}

export function deleteConversation<T>(params:any) {
  console.log(params)
  return deleteRequest<T>({
    url: `/luomacode-api/conversation`,
    data: {
      data: params
    },
  })
}

export function editConversation<T>(params: any) {
  return put<T>({
    url: `/luomacode-api/conversation`,
    data: params
  })
}
export function getConversationDetail<T>(params: any) {
  return get<T>({
    url: `/luomacode-api/conversation`,
    data: params,
  })
}

