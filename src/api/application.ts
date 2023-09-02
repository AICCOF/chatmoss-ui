import post, { get, put } from '@/utils/request'

export interface ApplicationListRequest {
  pageSize: number
  pageNum: number
  appType?:string
}

export function getApplicationList<T>(data: ApplicationListRequest) {
  return get<T>({
    url: '/luomacode-api/application/list',
    data,
  })
}

export function getApplicationTypeList<T>() {
  return get<T>({
    url: '/luomacode-api/application/typeList',
    data: {},
  })
}

export function getApplicationIconList<T>() {
  return get<T>({
    url: '/luomacode-api/application/iconList',
    data: {
      pageSize: 100,
      pageNum: 1,
    },
  })
}

export function getApplicationCreate<T>(data) {
  return post<T>({
    url: '/luomacode-api/application/create',
    data,
  })
}
export function getApplicationUpdate<T>(data) {
  return post<T>({
    url: '/luomacode-api/application/update',
    data,
  })
}

export function getApplicationMy<T>() {
  return get<T>({
    url: '/luomacode-api/application/my',
    data: {
      pageSize: 1000,
      pageNum: 1,
    },
  })
}
export function getApplicationSearch<T>(appName) {
  return get<T>({
    url: '/luomacode-api/application/search',
    data: {
      appName,
    },
  })
}
// /application/queryById
export function getApplicationQueryById<T>(id) {
  return get<T>({
    url: '/luomacode-api/application/queryById',
    data: {
      id,
    },
  })
}
export function getApplicationInstallList<T>() {
  return get<T>({
    url: '/luomacode-api/application/install/list',
    data: {
      pageSize: 1000,
      pageNum: 1,
    },
  })
}

export function getApplicationDelete<T>(appId) {
  return post<T>({
    url: '/luomacode-api/application/delete',
    data: {
      appId,
    },
  })
}

export function getApplicationSort<T>(data) {
  return put<T>({
    url: '/luomacode-api/application/install/sort',
    data,
  })
}

export function getApplicationInstall<T>(data) {
  // 0 安装, 1 卸载
  return post<T>({
    url: '/luomacode-api/application/install',
    data,
  })
}

export function getApplicationLike<T>(data) {
  // 0 安装, 1 卸载
  return post<T>({
    url: '/luomacode-api/application/like',
    data,
  })
}
export function updateAppConfig<T>(data) {
  return post<T>({
    url: '/luomacode-api/application/install/updateAppConfig',
    data,
  })
}