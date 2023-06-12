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
  timesInfo?: {
    dayResidue: {
      '3.5': {
        '1001': number
        '1002': number
        '1003': number
      }
      '4.0': {
        '1004': number
        '1005': number
        '1006': number
      }
    }
    timesResidue: {
      '3.5': number
      '4.0': number
    }
  }
  user: { nickname: string; email: string; plusEndTime: undefined; authed?: boolean }
}

export interface UserState {
  userInfo: UserInfo
  activityList: {
    img: string;
    isSelf: boolean;
    url: string
  }[]
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo.svg',
      name: 'LMC',
      description: '罗码Code出品',
      paymentType: 0,
      residueCount: 0,
      fourRate: 125,
      fourSwitch: '',
      openaiVersion: '3.5',
      isFinishGuide: false,
      notices: [],
      user: { nickname: '', email: '', plusEndTime: undefined },
     
    },
    activityList: [],
  }
}
export function getLocalState(): UserState {
  const localSetting: UserState = ss.get(LOCAL_NAME) || {}
  const userInfo = {
    ...defaultSetting().userInfo,
    ...localSetting.userInfo,
  }
  // console.log(userInfo)
  return { userInfo, activityList: [], appId: localSetting.appId, toggle: localSetting.toggle }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
