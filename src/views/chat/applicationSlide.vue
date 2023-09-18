<script setup lang='ts'>
import { NDrawer, NDrawerContent } from 'naive-ui'
import applicationList from './applicationList.vue'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
const userStore = useUserStore()
let time
let time1
function mouseleave(e) {
  if (userStore.slideActive) {
    clearTimeout(time)
    userStore.sliderToggle = false
  }
}

function iconMouseenter() {
  if (userStore.slideActive) {
    mouseenter()
  }
}
function mouseenter() {
  clearTimeout(time1)
  time = setTimeout(() => {
    userStore.sliderToggle = true
  }, 300)
}
</script>

<template>
  <div class="absolute  transition-all w-[0px] bg-[#212430] duration-180 h-full left-[0] top-[0]">
    <NDrawer v-model:show="userStore.sliderToggle" class="my-drawer !bg-[#212430]" :width="106" placement="left">
      <NDrawerContent>
        <!-- @mouseleave="mouseleave" -->
        <applicationList @mouseleave="mouseleave" @mouseenter="mouseenter" />
      </NDrawerContent>
    </NDrawer>
    <!-- @mouseenter="() => userStore.sliderToggleMode()" -->

    <div style="cursor: pointer;" class="absolute  top-[180px] z-10 w-[40px] h-[60px] flex items-center justify-start"
      @mouseenter="iconMouseenter" @click="mouseenter">
      <div
        class="m-pointer plugin-btn  w-[30px] h-[30px] rounded-full  overflow bg-[#00000033] -ml-[15px] text-[#fff] dark:bg-[#ffffff33] text-[24px] flex items-center justify-center pl-[10px]"
        style="">
        <SvgIcon icon="formkit:right" />
      </div>
    </div>
  </div>
</template>
