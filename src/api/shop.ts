import  { Request } from '@/utils/request'

let request = Request



export function mallList<T>() {
  return request<T>({
    method: "get",
    url: `/luomacode-api/mall/list`,
    data: {},
  });
}

export function payPrePay<T>(data) {
  return request<T>({
    method: "post",
    url: `/luomacode-api/pay/prePay`,
    data,
  });
}

export function payType<T>(data) {
  return request<T>({
    method: "get",
    url: `/luomacode-api/pay/payType`,
    data,
  });
}
export function payStatus<T>(data) {
  return request<T>({
    method: "get",
    url: `/luomacode-api/pay/payStatus`,
    params: data,
  });
}

export function orderList<T>(data) {
  return request<T>({
    method: "get",
    url: `/luomacode-api/order/list`,
    params: data,
  });
}

export function cancelPay<T>(data) {
  return request<T>({
    method: "post",
    url: `/luomacode-api/pay/cancelPay`,
    params: data,
  });
}

export function toMoss<T>(data: { code: string }) {
  return request<T>({
    method: 'post',
    url: '/luomacode-api/redeem/toMoss',
    data,
  });
}

export function exchange<T>(data: Record<string, String>) {
  return request<T>({
    method: 'post',
    url: `/luomacode-api/redeem/toTimes`,
    data,
  });
}