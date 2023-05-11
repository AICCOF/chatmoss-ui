import { defineStore } from 'pinia'
// import { getToken } from '../auth/helper'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { residueCount } from '@/api'
import { localStorage } from '@/utils/storage/localStorage'
export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  getters: {
    getNotices(state) {
      return state.userInfo.notices
    },
    getOpenaiVersion(state) {
      return state.userInfo.openaiVersion
    },
    isHighVersion(state) {
      return state.userInfo.openaiVersion == '4.0'
    },
    residueCount(state) {
      return state.userInfo.residueCount * 10
    },
    // state.userInfo.fourSwitch !== 'ON' || !!localStorage.getItem('apiKey')
    options(state) {
      return [
        {
          label: 'ChatGPT3.5',
          value: '3.5',
          disabled: false,
        },
        {
          label: 'ChatGPT4.0',
          value: '4.0',
          disabled: false,
        },
      ]
    },
    isHighVersionMsg(state) {
      if (!state.userInfo.timesInfo)
        return true

      return state.userInfo.timesInfo.timesResidue['4.0'] === 0
    },
    isAsk(state) {
      // 未包月的情况
      if (!state.userInfo.timesInfo) {
        // 字符数小于0
        if (this.residueCount <= 0) {
          return false
        }
        return true;
      }
      // 包月的情况，3.5 4.0次数哟用完
      if (state.userInfo.timesInfo.timesResidue['3.5'] == 0 || state.userInfo.timesInfo.timesResidue['4.0'] == 0) {
        // 字符数小于0
        if (this.residueCount <= 0) {
          return false
        }
      }
      return true;
    },
    packageList(state) {
      if (!state.userInfo.timesInfo)
        return []

      return [
        {
          title: '3.5套餐',
          timesResidue: state.userInfo.timesInfo.timesResidue['3.5'],
          list: [
            { title: '基础套餐', day: state.userInfo.timesInfo.dayResidue['3.5']['1001'] },
            { title: '高级套餐', day: state.userInfo.timesInfo.dayResidue['3.5']['1002'] },
            { title: '顶级套餐', day: state.userInfo.timesInfo.dayResidue['3.5']['1003'] },
          ],
        },
        {
          title: '4.0套餐',
          timesResidue: state.userInfo.timesInfo.timesResidue['4.0'],
          list: [
            { title: '基础套餐', day: state.userInfo.timesInfo.dayResidue['4.0']['1004'] },
            { title: '高级套餐', day: state.userInfo.timesInfo.dayResidue['4.0']['1005'] },
            { title: '顶级套餐', day: state.userInfo.timesInfo.dayResidue['4.0']['1006'] },
          ],
        },
      ]
    },

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

        this.userInfo.timesInfo = undefined;

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
    saveOpenaiVersion(value: string) {
      this.userInfo.openaiVersion = value
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
