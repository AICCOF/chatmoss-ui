import { Request } from '@/utils/request'

let request = Request

export function getPlugin<T>(data) {
  return request<T>({
    method: 'get',
    url: 'http://43.129.237.44:9000/get-plugin',
    data,
  });
}

export function execPlugin<T>(data: any) {
  return request<T>({
    method: 'post',
    url: 'http://43.129.237.44:9000/exec-plugin',
    data,
  });
}

export function checkPlugin<T>(data: any) {
  return request<T>({
    method: 'post',
    url: 'http://43.129.237.44:9000/check-plugin',
    data,
  });
}
