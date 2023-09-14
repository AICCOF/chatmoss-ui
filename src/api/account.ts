
import { Request } from '@/utils/request'

let request = Request
export function accountClose<T>(data?: { email: string; password: string; nickname?: string }) {
  return request<T>({
    method: 'post',
    url: '/luomacode-api/account/close',
    data,
  });
}
