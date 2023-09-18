<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
// import { useRouter } from 'vue-router'

import { useRouter } from 'vue-router'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useGo } from '@/utils/router'
import { useUserStore } from '@/store'
import { useTheme } from '@/hooks/useTheme'
// router.replace({ name: 'chat', params: { uuid: chatStore.active } })
const { vantTheme } = useTheme()

// console.log('theme', vantTheme)
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
const userStore = useUserStore()
const router = useRouter()
const go = useGo()
const tabList = ref([
  {
    title: '首页',
    path: '/chat',
    img: {
      light: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item1_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item1.png',
      },
      dark: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item1_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item1.png',
      }
    }
  },
  {
    title: '教程',
    path: '/source',
    img: {
      light: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item2_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item2.png',
      },
      dark: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item2_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item2.png',
      }
    }
  },
  {
    title: '消息',
    path: '/notice',
    img: {
      light: {
        activeImg: 'https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/layout/light_notice.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_notice.png',
      },
      dark: {
        activeImg: 'https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/layout/dark-notice.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_notice.png',
      }
    }
  },

  {
    title: '我的',
    path: '/my',
    img: {
      light: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item3_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/light_item3.png',
      },
      dark: {
        activeImg: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item3_a.png',
        img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/tab02/dark_item3.png',
      }
    }
  },
])
// console.log(router.currentRoute)
const active = ref(router.currentRoute.value.path)

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
            <transition name="height" :duration="{ enter: 300, leave: 300 }">
              <div v-show="userStore.userInfo && userStore.userInfo.user && userStore.toggleValue"
                class="element-to-animate1 bg-[#F6F7FA] dark:bg-[#161616]">
                <van-tabbar v-model="active" style="margin: 0 auto;" @change="handleChange">
                  <van-tabbar-item v-for="(item, i) of tabList " :key="i" :name="item.path">

                    <div class="item text-center pb-[8px]  -mt-[10px] relative"
                      :class="[active == item.path ? 'dark:text-[#ffffff] text-[#1A1A1A]' : 'text-[#1a1a1a] dark:text-[#686868]']">
                      <van-badge color="#ff536f"
                        :content="(item.path === '/notice' && userStore.redCount > 0) ? userStore.redCount : undefined"
                        max="99" style="position: absolute;right:5px;top:10px;z-index: 100;border-color: #fff;">
                      </van-badge>
                      <div class="w-[36px] h-[36px] img">
                        <img v-show="active === item.path" :src="item.img[vantTheme].activeImg" class="w-[100%]" alt="">
                        <img v-show="active !== item.path" :src="item.img[vantTheme].img" class="w-[100%]" alt="">
                      </div>
                      <div class="">
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
.item {
  &:hover {
    .img {
      transform: scale(0.9);
    }
  }
}

.element-to-animate1 {
  /* 元素的初始高度 */
  // height: 60px;
  transition: all 0.3s;
}
</style>
