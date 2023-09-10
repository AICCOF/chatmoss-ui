<template>
  <div class="absolute  transition-all w-[0px] bg-[#212430] duration-180 h-full left-[0] top-[0]">
    <NDrawer class="my-drawer !bg-[#212430]" v-model:show="userStore.sliderToggle" :width="80" placement="left">
      <NDrawerContent>
        <applicationList></applicationList>
      </NDrawerContent>
    </NDrawer>
    <div  @click="userStore.sliderToggleMode"
      class="m-pointer  plugin-btn absolute w-[30px] h-[30px] rounded-full -right-[13px] top-[150px] overflow bg-[#00000033] z-10 text-[#fff] dark:bg-[#ffffff33] text-[24px] flex items-center justify-center pl-[10px]"
      style="">
      <SvgIcon  icon="formkit:right" />
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