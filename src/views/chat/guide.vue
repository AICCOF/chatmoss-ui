<script setup lang='ts'>
import { getCurrentInstance, onMounted } from 'vue'
import { useAppStore, useUserStore } from '@/store'
const appStore = useAppStore()
const userStore = useUserStore()
const steps = [
  {
    target: '.header-right-item1',
    content: '不用登录就可以在设置中心设置key使用3.5模型',
    params: {
      placement: 'right',
    },
  },
  {
    target: '.header-right-item2',
    content: 'ChatMoss商店可以购买字符和包月模式，更有4.0模型套餐',
    params: {
      placement: 'right',
    },
  },
  {
    target: '.tip-text-content1',
    content: '登录后可以在活动中进行签到，每周可获得78000字符奖励',
  },
  {
    target: '.text-test1',
    content: '这里可以看自己的包月套餐余额，和自己字符余额',
  },
  {
    target: '.step1',
    content: '在这里可以输入你的问题，Shift + Enter = 换行，Enter 发送消息',
  },
  {
    target: '.step1',
    content: '输入/可唤起预设角色哦~，回答更加准确',
  },
  {
    target: '.footer-item-btn1',
    content: '这里可以新建会话，建议一个问题一个会话，这样会节省字符',
  },
  {
    target: '.footer-item-btn2',
    content: '这里可以看到自己历史的会话记录',
  },
  {
    target: '.header-right-item-help',
    content: '更多问题解答和更多平台使用，请点击ChatMoss帮助中心',
  },
  {
    target: '.no-data-info-title1',
    content: '点击这里可以快捷切换3.5模型或者4.0模型哦~',
  },
  // {
  //   target: '.step4',
  //   content: '登录后每天将有免费的字符额度可以使用，快去注册登录吧~',
  //   params: {
  //     placement: 'right',
  //   },
  //   before: () => {
  //     return new Promise((res) => {
  //       appStore.setSiderCollapsed(false)
  //       setTimeout(() => {
  //         res(true)
  //       }, 300)
  //     })
  //   },
  // },
]

const options = {
  useKeyboardNavigation: false,
  labels: {
    buttonSkip: '跳过',
    buttonPrevious: '上一步',
    buttonNext: '下一步',
    buttonStop: '完成',
  },
}

const myCallbacks = {
  onStart: (currentStep: number) => {
    appStore.setSiderCollapsed(true)
  },
  // onNextStep: (currentStep: number) => {
  //   if(currentStep==3){
  //     appStore.setSiderCollapsed(false)
  //   }
  // },
  onSkip: () => {
    userStore.setGuide(true)
  },
  onFinish: () => {
    userStore.setGuide(true)
  },
  onStop: () => {
    userStore.setGuide(true)
  },

}
onMounted(() => {
  const vm = getCurrentInstance()

  if (!userStore.$state.userInfo.isFinishGuide)
    vm && vm.appContext.config.globalProperties.$tours.myTour.start()
})
</script>

<template>
  <div>
    <v-tour name="myTour" class="tour" :steps="steps" :options="options" :callbacks="myCallbacks" />
  </div>
</template>

<style>
.tour {
  position: fixed;
  z-index: 100;
  /* width: 200px; */
  min-width: 380px;
}
</style>
