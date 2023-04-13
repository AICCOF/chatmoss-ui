
import axios from "axios";
import { ss } from '@/utils/storage'

const DOMAIN = 'DOMAIN'

let remoteURL = import.meta.env.VITE_APP_API_BASE_URL

console.log(import.meta.env)
let defaultURL = 'http://chatmoss-v2.aihao123.cn'

export function setDomain(url:string) {
  ss.set(DOMAIN, url)
}

export function getDomain():string {
  return ss.get(DOMAIN)
}

export default function getDomainAPI(){
  return axios.get(remoteURL).then((res)=>{
    setDomain(res.data)
    return Promise.resolve(res)
  }).catch((res)=>{
    setDomain(defaultURL)
    return Promise.reject(res)
  })
}