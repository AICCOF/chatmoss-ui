<template>
  <div class="absolute  transition-all w-[0px] bg-[#212430] duration-180 h-full left-[0] top-[0]"
    :style="{ width: userStore.toggleValue && userStore.sliderToggle ? '65px' : '0px' }">
    <NDrawer class="my-drawer !bg-[#212430]" v-model:show="userStore.sliderToggle" :width="65" placement="left">
      <NDrawerContent>
        <applicationList></applicationList>
      </NDrawerContent>
    </NDrawer>
    <div v-show="userStore.toggleValue" @click="userStore.sliderToggleMode"
      class="m-pointer  plugin-btn absolute w-[30px] h-[30px] rounded-full -right-[18px] top-1/2 overflow bg-[#00000033] text-[#fff] dark:bg-[#ffffff33] text-[24px] flex items-center justify-center"
      style="z-index: 10000;">
      <SvgIcon v-if="userStore.sliderToggle" icon="formkit:left" />
      <SvgIcon v-if="!userStore.sliderToggle" icon="formkit:right" />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { NDrawer, NDrawerContent } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import applicationList from './applicationList.vue'
import { useUserStore, } from '@/store'
const userStore = useUserStore()




</script>