import { ss } from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface Notice {
  content: string
  createTime: string
  icon: string
}
export interface UserInfo {
  isFinishGuide: boolean
  notices: Notice[]
  avatar: string
  name: string
  description: string
  paymentType: number
  fourRate: number
  fourSwitch: string
  openaiVersion: string
  residueCount: number
  user: { nickname: string; email: string; plusEndTime: undefined; authed?: boolean }
}

export interface UserState {
  userInfo: UserInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo.svg',
      name: 'LMC',
      description: '罗码Code出品',
      paymentType: 0,
      residueCount: 0,
      fourRate:125,
      fourSwitch:"",
      openaiVersion:"3.5",
      isFinishGuide: false,
      notices: [],
      user: { nickname: '', email: '', plusEndTime: undefined },
    },

  }
}
export function getLocalState(): UserState {
  const localSetting: UserState = ss.get(LOCAL_NAME) ||{}
  let userInfo ={
    ...defaultSetting().userInfo,
    ...localSetting.userInfo
  }
  return { userInfo }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
