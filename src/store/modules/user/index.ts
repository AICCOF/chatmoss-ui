import { defineStore } from 'pinia'
import { getToken } from '../auth/helper'
import type { UserInfo } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { getActivityList, residueCount } from '@/api'
import { localStorage } from '@/utils/storage/localStorage'
import type { Notice } from '@/store/modules/user/helper'
import { getSystemNotice } from '@/api/personCenter'
import { getApplicationInstallList } from '@/api/application'
import { getModelList } from '@/api/weixin'
export const useUserStore = defineStore('user-store', {
  state: () => {
    return {
      ...getLocalState(),
      centerPicUrl: '',
      modelList: [],
      modeVersion: {},
      appList: {},
      notices: [],
      // useKey: '1',
      isAuth: 0, // 0 代表初始状态,1代表未登录,2 代表登录,3.登录过期,
    }
  },
  getters: {
    toggleValue(state) {
      if (!state.toggle) {
        return true;
      }
      return state.toggle === '0'
    },
    appIdValue(state) {
      return state.appId || '1'
    },
    isQuestionMode(state) {
      return state.appIdValue === '2'
    },
    getNotices(state) {
      return state.userInfo.notices
    },
    getModelList(state) {
      return state.modelList || []
    },
    getOpenaiVersion(state) {
      return state.userInfo.openaiVersion
    },
    getModeVersion(state) {
      return state.modeVersion || {}
    },
    isHighVersion(state) {
      return state.userInfo.openaiVersion == '4.0'
    },
    residueCount(state) {
      return state.userInfo.residueCount * 10
    },
    // state.userInfo.fourSwitch !== 'ON' || !!localStorage.getItem('apiKey')
    isHighVersionMsg(state) {
      if (!state.userInfo.timesInfo)
        return true

      return state.userInfo.timesInfo.timesResidue['4.0'] === 0
    },
    isAsk(state) {
      // 未包月的情况
      if (!state.userInfo.timesInfo) {
        // 字符数小于0
        if (this.residueCount <= 0)
          return false

        return true
      }
      // 包月的情况，3.5 4.0次数哟用完
      if (state.userInfo.timesInfo.timesResidue['3.5'] == 0 && state.userInfo.timesInfo.timesResidue['4.0'] == 0) {
        // 字符数小于0
        if (this.residueCount <= 0)
          return false
      }
      return true
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
    activities(state) {
      return state.activityList
    },
    appsListMap(state) {
      const map = {}
      if (state.appList.installList) {
        state.appList.installList.forEach((row) => {
          map[row.appId] = {
            system: 0,
            ...row,
          }
        })
      }
      if (state.appList.systemList) {
        state.appList.systemList.forEach((row) => {
          map[row.appId] = {
            system: 1,
            ...row,
          }
        })
      }

      return map
    },
    currentApp(state) {
      // console.log(state.appsListMap, )
      return state.appsListMap[state.appIdValue]
    },
  },
  actions: {
    toggleMode() {
      this.toggle = this.toggle === '0' ? "1" : '0'
      // console.log(this.toggle)
      this.recordState()
    },
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

        this.userInfo.timesInfo = undefined

        this.userInfo = {
          ...this.userInfo, ...res.data,
        }
        // 0 代表初始状态, 1代表未登录, 2 代表登录, 3.登录过期
        if (res.data && res.data.user) {
          this.centerPicUrl = res.data.centerPicUrl
          this.userInfo.user.authed = false
          this.isAuth = 2
        }
        else {
          if (getToken())
            this.isAuth = 3
          else
            this.isAuth = 1
        }

        return Promise.resolve(res)
      }
      catch (error: any) {
        if (error.code === 204)
          localStorage.removeItem('SECRET_TOKEN')

        return Promise.reject(error)
      }
    },
    async getSystemNoticeAPI() {
      const res = await getSystemNotice<Notice[]>()
      this.setNotices(res.data)
    },
    async getActivityListAPI() {
      if (getToken()) {
        const res = await getActivityList<any>()
        this.activityList = res.data || []
      }
      // console.error(res.data)
    },
    async getApplicationInstallListAPI() {
      if (getToken()) {
        const res = await getApplicationInstallList()
        this.appList = res.data || {
          installList: [],
          systemList: [],
        }
      }

    },
    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },
    saveOpenaiVersion(value: string) {
      this.modeVersion = value
      this.userInfo.openaiVersion = value.codeName
      this.recordState()
    },
    toggleOpenaiVersion(){
      this.saveOpenaiVersion(this.modelList[1])
    },
    async getOpenaiList() {
      // todo
      let res = await getModelList()
      this.modelList = (res.data || []).map((row) => {
        return {
          ...row,
          text: row.viewName
        }
      })
      //判断选中
      if (this.userInfo.openaiVersion) {
        const index = this.modelList.findIndex(item => item.codeName === this.userInfo.openaiVersion)
        if (index !== -1) {
          this.modeVersion = this.modelList[index]
          this.userInfo.openaiVersion = this.modelList[index].codeName
        } else {
          this.modeVersion = this.modelList[0]
          this.userInfo.openaiVersion = this.modelList[0].codeName
        }
      } else {
        this.modeVersion = this.modelList[0]
        this.userInfo.openaiVersion = this.modelList[0].codeName
      }
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
    setAppId(appId) {
      this.appId = appId
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
