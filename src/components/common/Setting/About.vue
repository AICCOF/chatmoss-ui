<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { fetchChatConfig } from '@/api'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
}

const loading = ref(false)

const config = ref<ConfigState>()

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        v1.1.0【内测】
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>
          此项目目前公测期间，可免费使用30-100字内容
        </p>
      </div>
      <div style="color: red">
        如果你想解锁更多输入限制，欢迎扫下方二维码，备注微信号，将会拉你到交流群，解锁500文字输入限制
      </div>
      <div class="z-list">
        <div>
          <div class="text">
            支付宝赞助
          </div>
          <img width="200" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/zfbhb.pic.jpg" alt="">
        </div>
      </div>
    </div>
  </NSpin>
</template>

<style lang="css">
.z-list {
	width: 420px;
	display: flex;
	justify-content: space-between;
}
.text {
	text-align: center;
}
</style>
