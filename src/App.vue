<script setup lang="ts">
import { ref, computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'

const { theme, themeOverrides, vantTheme } = useTheme()
const { language } = useLanguage()
import icontem1 from '@/assets/tab/icon-item1.png'
import icontem2 from '@/assets/tab/icon-item2.png'
import icontem3 from '@/assets/tab/icon-item3.png'
import icontem1a from '@/assets/tab/icon-item1_a.png'
import icontem2a from '@/assets/tab/icon-item2_a.png'
import icontem3a from '@/assets/tab/icon-item3_a.png'

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
    path: '/course',
    activeImg: icontem3a,
    img: icontem3
  }
])
let active = ref('/chat')



</script>

<template>
  <NConfigProvider class="h-full" :theme="theme" :theme-overrides="themeOverrides" :locale="language">
    <NaiveProvider>
      <van-config-provider :theme="vantTheme" class="h-full">
        <div class="flex" style="height: 100%;flex-direction: column;">

          <div class="flex-1 overflow-hidden">
            <RouterView />
          </div>

          <div>
            <van-tabbar v-model="active" route >
              <van-tabbar-item replace :name="item.path" :to="item.path" v-for="(item, i) of  tabList " :key="i">

                <div class="text-center pb-[10px] text-[#A4A4A6] hover:scale-90" :class="[active == item.path ? 'text-[#ffffff]' : '']">
                  <img v-show="active === item.path" :src="item.activeImg" class="w-[36px]" alt="">
                  <img v-show="active !== item.path" :src="item.img" class="w-[36px]" alt="">
                  <div>
                    {{ item.title }}
                  </div>
                </div>
              </van-tabbar-item>
            </van-tabbar>
          </div>

        </div>

      </van-config-provider>
    </NaiveProvider>
  </NConfigProvider>
</template>
