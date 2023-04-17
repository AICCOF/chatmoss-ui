import { defineStore } from 'pinia'
// import { getToken } from '../auth/helper'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { residueCount } from '@/api'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {
    async residueCountAPI() {
      // const token = getToken()
      // if (!token)
      //   return
      try {
        const res = await residueCount<{
          residueCount: number
          paymentType: number
        }>()
        // console.log(res)
        this.userInfo = {
          ...this.userInfo, ...res.data,
        }
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
    setGuide(value:boolean){
      this.userInfo.isFinishGuide = value;
      this.recordState();
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
