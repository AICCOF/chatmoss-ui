<template>
  <div v-if="userStore.currentApp" class="no-data-info-text text-left">
    <div class="flex">
      <div>
        <img :src="userStore.currentApp.iconUrl" alt="" style="width:60px;height:60px">
      </div>
      <div class="pl-2 text-left">
        <div class="text-xl">{{ userStore.currentApp.appName }}</div>
        <div class="text-sm">{{ userStore.currentApp.desc }}</div>
      </div>
    </div>
    <van-divider />
    <div class="text-sm text-left">{{ userStore.currentApp.detailInfo || 'detailInfo' }}</div>

    <div class="text-sm text-left guideMsg">{{ userStore.currentApp.guideMsg || 'guideMsg' }}</div>
  </div>
</template>
<script setup lang='ts'>
import {useUserStore } from '@/store'
const userStore = useUserStore()
</script>
<style lang="less" scoped >
.guideMsg {
  text-align: left;
  display: inline-block;
  border-radius: 60px;
  margin-top: 10px;
  background-color: var(--moss-bg-reply-color);
  color: var(--moss-text-time-color);
  padding: 4px 10px;
}
</style>