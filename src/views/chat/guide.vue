<script setup lang='ts'>
import { getCurrentInstance, onMounted } from 'vue'
import { useAppStore, useUserStore } from '@/store'
const appStore = useAppStore()
const userStore = useUserStore()
const steps = [
  {
    target: '.step1',
    content: '在这里可以输入你的问题，Shift + Enter = 换行，Enter 发送消息',
  },
  {
    target: '.step1',
    content: '输入/可唤起预设角色哦~，回答更加准确',
  },
  {
    target: '.step2',
    content: '开启上下文后，字符消耗 = 问的问题字数 + 回答的答案字数之和，新问题新建问题进行问答更节省字符',
  },
  {
    target: '.step3',
    content: '联网模式将会从网络上查询资料后，再结合您的问题，综合进行回答；开启联网模式后，上下文模式将自动关闭，只会去网络上查询您当前提问的这个问题；因为目前无法智能的分析您的问题是否需要联网，所以需要进行网络查询的时候，开启联网模式，不需要上网查询的时候关闭联网模式，这样效果最好。',
  },
  {
    target: '.step4',
    content: '登录后每天将有免费的字符额度可以使用，快去注册登录吧~',
    params: {
      placement: 'right',
    },
    before: () => {
      return new Promise((res) => {
        appStore.setSiderCollapsed(false)
        setTimeout(() => {
          res(true)
        }, 300)
      })
    },
  },
  {
    target: '.step5',
    content: '字符不够使用，可以进入ChatMoss商店进行字符购买',
    params: {
      placement: 'right',
    },
  },
  {
    target: '.step6',
    content: '在个人中心，可以设置key，填写key之后，将不会消耗ChatMoss字符数；个人中心还可以对ChatMoss系统进行设置。',
    params: {
      placement: 'right',
    },
  },
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
