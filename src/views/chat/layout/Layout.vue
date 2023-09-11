<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
// import { useRouter } from 'vue-router'


import { useBasicLayout } from '@/hooks/useBasicLayout'
// router.replace({ name: 'chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

// const collapsed = computed(() => appStore.siderCollapsed)


const getMobileClass = computed(() => {
  return ['rounded-none', 'shadow-none']
  // return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
  ]
})
import icontem1 from '@/assets/tab/icon-item1.png'
import icontem2 from '@/assets/tab/icon-item2.png'
import icontem3 from '@/assets/tab/icon-item3.png'
import icontem1a from '@/assets/tab/icon-item1_a.png'
import icontem2a from '@/assets/tab/icon-item2_a.png'
import icontem3a from '@/assets/tab/icon-item3_a.png'
import { useBack, useGo } from '@/utils/router'
import { useChatStore, useUserStore, useAuthStoreWithout } from '@/store'

import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const go = useGo()
let tabList = ref([
  {
    title: '首页',
    path: '/chat',
    activeImg: icontem1a,
    img: icontem1
  },
  {
    title: '教程',
    path: '/source',
    activeImg: icontem2a,
    img: icontem2
  },
  {
    title: '我的',
    path: '/my',
    activeImg: icontem3a,
    img: icontem3
  }
])
// console.log(router.currentRoute)
let active = ref(router.currentRoute.value.path)

function handleChange(path) {
  // if (path === '/source') {
  //   showToast('开发中')
  //   return
  // }
  // console.log(path)
  go(path)
}



</script>

<template>
  <div class="h-full transition-all" :class="[isMobile ? 'p-0' : 'p-0']">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>

        <NLayoutContent class="h-full">
          <div class="flex" style="height: 100%;flex-direction: column;overflow-y: hidden;">

            <div class="flex-1 overflow-hidden">
              <RouterView v-slot="{ Component, route }">
                <component :is="Component" :key="route.fullPath" />
              </RouterView>

            </div>
            <transition name="height">
              <div v-show="userStore.userInfo && userStore.userInfo.user && userStore.toggleValue"
                class="element-to-animate1 bg-[#F6F7FA] dark:bg-[#161616]">
                <van-tabbar v-model="active" @change="handleChange" 
                style="margin: 0 auto;"
                >
                  <van-tabbar-item :name="item.path" v-for="(item, i) of  tabList " :key="i">
                    <div class="text-center pb-[10px] text-[#A4A4A6] hover:scale-90"
                      :class="[active == item.path ? 'dark:text-[#ffffff] text-[#1A1A1A]' : '']">
                      <img v-show="active === item.path" :src="item.activeImg" class="w-[36px]" alt="">
                      <img v-show="active !== item.path" :src="item.img" class="w-[36px]" alt="">
                      <div>
                        {{ item.title }}
                      </div>
                    </div>
                  </van-tabbar-item>
                </van-tabbar>
              </div>
            </transition>
          </div>
        </NLayoutContent>
      </NLayout>
    </div>
  </div>
</template>
<style lang="less">
.element-to-animate1 {
  /* 元素的初始高度 */
  height: 62px;
}
</style>
