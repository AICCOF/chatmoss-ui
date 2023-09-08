<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store'
const userStore = useUserStore()
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
  },
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
  },
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
</script>

<template>
  <transition name="fade1">
    <header v-if="userStore.toggleValue" class="header-main">
      <div class="relative" style="width: 100%;height: 100%;">
        <div style="width: 100%;height: 100%;overflow-y: scroll;">
          <div class="flex pl-[24px] pr-[100px] h-full" style="width: max-content;">
            <div v-for="(item, i) of tabList" :key="i" class="mr-[36px] flex items-center">
              <div>
                <img :src="item.activeImg" class="w-[36px] h-[36px]" alt="">
                <div class="mt-[7px] text-center">{{ item.title }}</div>
              </div>
              
            </div>
          </div>
        </div>

      </div>
      <div class="absolute flex justify-center items-center money" style="right:0;
            top:0;width: 100px;height: 100%;">
        <div class="flex justify-center items-center" style="width: 54px;
            height: 27px;
            font-size: 11px;
            font-weight: 600;
            color: #FFE69F;
            line-height: 15px;
            background: linear-gradient(90deg, #1F2654 0%, #2D3253 100%);
            border-radius: 13px;
        ">
          余额
        </div>
      </div>
    </header>
  </transition>
</template>

<style lang="less">

.money{
   background: linear-gradient(90deg, #16161600 0%,#161616 20%, #161616 100%);
}
.header-main {
  height: 90px;
  width: 100%;
  display: flex;
  align-items: center;
  min-width: 250px;
  overflow: hidden;
  position: fixed;
  // height: 96px;
  align-items: center;
  user-select: none;
  z-index: 20;
  font-size: 14px;
  // background-color: var(--moss-header-color);
  // // background-color: rgba(28, 28, 30, .1);
  // color: var(--moss-text-blue-color);
  left: 0;
  top: 0;

}

.page .header {
  padding: 0px;
}
</style>
