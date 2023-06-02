import post, { deleteRequest, get, put } from '@/utils/request'



export function getConversationList<T>(data) {
  return get<T>({
    url: `/luomacode-api/conversation/list`,
    data: data,
  })
}


export function addConversation<T>(params: any) {
  return post<T>({
    url: `/luomacode-api/conversation`,
    data: params,
  })
}

export function deleteConversation<T>(params:any) {
  return deleteRequest<T>({
    url: `/luomacode-api/conversation`,
    data: {
      data: params
    },
  })
}
export function deleteBatchConversation<T>(params: any) {
  return deleteRequest<T>({
    url: `/luomacode-api/conversation/batch`,
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

