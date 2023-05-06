import { defineStore } from 'pinia'
// import { getToken } from '../auth/helper'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { residueCount } from '@/api'
import { localStorage } from "@/utils/storage/localStorage";
export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  getters: {
    getNotices(state) {
      return state.userInfo.notices
    },
    getOpenaiVersion(state){
      return state.userInfo.openaiVersion
    },
    isHighVersion(state){
      return state.userInfo.openaiVersion =='4.0'
    },
    residueCount(state){
      return state.userInfo.residueCount * 10
    },
		// state.userInfo.fourSwitch !== 'ON' || !!localStorage.getItem('apiKey')
    options(state){
      
      return [
        {
          label: 'ChatGPT3.5',
          value: '3.5',
          disabled: false,
        },
        {
          label: 'ChatGPT4.0',
          value: '4.0',
          disabled: false
        },
      ]
    }
  },
  actions: {
    async residueCountAPI() {
      try {
        const res = await residueCount<{
          residueCount: number
          paymentType: number
          user?: {
            nickname: string
            email: string
            plusEndTime: undefined
            authed: boolean
          }
        }>()

        this.userInfo = {
          ...this.userInfo, ...res.data,
        }

        if (!res.data.user)
          this.userInfo.user.authed = false

        return Promise.resolve(res)
      }
      catch (error: any) {
        if (error.code === 204)
          localStorage.removeItem('SECRET_TOKEN')

        return Promise.reject(error)
      }
    },
    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },
    saveOpenaiVersion(value:string){
      this.userInfo.openaiVersion = value;
      this.recordState()
    },
    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },
    setGuide(value: boolean) {
      this.userInfo.isFinishGuide = value
      this.recordState()
    },

    setNotices(value: any[]) {
      this.userInfo.notices = value
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
