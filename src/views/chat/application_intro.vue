<script setup lang='ts'>
import { useUserStore } from '@/store'
const userStore = useUserStore()
import { showImagePreview } from 'vant';
async function handlePreImg(row) {
  if (row.images && row.images.length > 0) {
    showImagePreview({
      images: row.images,
      closeable: true,
    });
  }

}
</script>

<template>
  <div>
    <div v-if="userStore.currentApp" style="position: relative;" class="no-data-info-text text-left notice">
      <div class="flex">
        <div>
          <img :src="userStore.currentApp.iconUrl" alt="" style="min-width:44px;height:44px;margin-right: 4px;">
        </div>
        <div class="pl-2 text-left main-center">
          <div class="text-sm" style="font-weight: 600;">
            {{ userStore.currentApp.appName }}
          </div>
          <div class="text-sm" style="opacity: .8; margin-top: 2px;">
            {{ userStore.currentApp.desc }}
          </div>
        </div>
        <button class="tip-btn" v-if="userStore.currentApp.images && userStore.currentApp.images.length>0" @click="handlePreImg(userStore.currentApp)">
          使用说明
        </button>
      </div>
    </div>
    <div
      v-if="userStore.currentApp && userStore.currentApp.guideMsg"
      class="no-data-info-text text-left notice inline-block"
    >
      <div>
        {{ userStore.currentApp.guideMsg || '引导语' }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.notice {
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

.tip-btn {
		position: absolute;
    right: 20px;
    top: 20px;
    color: #6b83ff;
}
</style>
