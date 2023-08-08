<script setup lang='ts'>
import { useUserStore } from '@/store'
const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.currentApp" class="no-data-info-text text-left notice">
    <div class="flex">
      <div>
        <img :src="userStore.currentApp.iconUrl" alt="" style="width:50px;height:50px;margin-right: 10px;">
      </div>
      <div class="pl-2 text-left main-center">
        <div class="text-xl">
          {{ userStore.currentApp.appName }}
        </div>
        <div class="text-sm">
          {{ userStore.currentApp.desc }}
        </div>
      </div>
    </div>
    <!-- <van-divider /> -->
    <!-- <div v-if="userStore.currentApp.detailInfo" class="text-sm text-left">
      {{ userStore.currentApp.detailInfo }}
    </div> -->

    <!-- <div v-if="userStore.currentApp.guideMsg" class="text-sm text-left guideMsg">
      {{ userStore.currentApp.guideMsg }}
    </div> -->
  </div>
</template>

<style lang="less" scoped>
.notice{
  // max-width: 800px;
  margin: 0 auto;
  margin-bottom: 20px;
}
.guideMsg {
  text-align: left;
  display: inline-block;
  border-radius: 60px;
  margin-top: 10px;
  background-color: var(--moss-bg-reply-color);
  color: var(--moss-text-time-color);
  padding: 4px 10px;
}
.main-center {
	display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
