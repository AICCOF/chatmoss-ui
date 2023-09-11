<script setup lang='ts'>
import { computed } from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
</script>

<template>
  <div class="flex items-center">
    <div class="w-10 h-10 overflow-hidden rounded-full">
      <template v-if="isString(userInfo.avatar) && userInfo.avatar.length > 0">
        <NAvatar
          size="large"
          round
          :src="userInfo.avatar"
          fallback-src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/avatar.jpg"
        />
      </template>
      <template v-else>
        <NAvatar size="large" round src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/avatar.jpg" />
      </template>
    </div>
    <div class="ml-2">
      <h2 class="font-bold text-md">
        {{ userInfo.name ?? 'ChatMoss' }}
      </h2>
      <p class="text-xs text-gray-500">
        <span
          v-if="isString(userInfo.description) && userInfo.description !== ''"
          v-html="userInfo.description"
        />
      </p>
    </div>
  </div>
</template>
