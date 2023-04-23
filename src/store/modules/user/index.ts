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
  },
  actions: {
    async residueCountAPI() {
      // const token = getToken()
      // if (!token)
      //   return
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
