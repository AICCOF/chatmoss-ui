<script setup lang='ts'>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useUserStore } from '@/store'
import { getToken } from '@/store/modules/auth/helper'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
import { localStorage } from '@/utils/storage/localStorage'
import {  useMessage } from 'naive-ui'
const emit = defineEmits<Emit>()
const useAuthStore = useAuthStoreWithout()
const Message = useMessage()
const userStore = useUserStore()
const chatStore = useChatStore()
const token = ref('')

interface Emit {
  (e: 'login'): void
}

function loginEvent(type: string) {
  if (type === 'login')
    emit('login')
  if (type === 'exit') {
    useAuthStore.setToken('')
    sendToMsg('chatMossToken', '')
    chatStore.clearList()
    userStore.residueCountAPI()
  }
}

// moss数量
const mossCount = computed(() => {
  const residueCount = userStore.userInfo.residueCount * 10
  return (localStorage.getItem('apiKey') !== '' && localStorage.getItem('apiKey') !== null)
    ? '正在使用Key'
    : `${residueCount > 10000 ? `${(Math.floor(residueCount / 100) / 100).toFixed(2)}w` : residueCount}字符`
})
// moss 描述
// const mossDesc = computed(() => localStorage.getItem('apiKey') ? ' ' : `（${userStore.userInfo.residueCount * 10}字符）`)
// 未登录状态下描述
const mossNoLogin = computed(() => `还可试用${userStore.userInfo.residueCount * 10}字符`)

// 重置token
const resetToken = () => {
  token.value = getToken() as string
}

watchEffect(() => {
  const { user } = userStore.userInfo
  if (user.email)
    resetToken()

  if(userStore.isAuth === 3){
    useAuthStore.setToken('')
    sendToMsg('chatMossToken', '')
    chatStore.clearList()
    userStore.residueCountAPI()
    Message.error('登录已过期,请重新登录')
  }
})

onMounted(() => {
  resetToken()
})
</script>

<template>
  <div class="tip-main">
    <div class="tip-text-content step4">
      <p v-if="token">
        剩余
        <span>{{ mossCount }}</span>
        <span class="v-exit" @click="loginEvent('exit')">退出登录</span>
      </p>
      <p v-else>
        <span v-if="mossCount === '正在使用Key'">正在使用key</span>
        <span class="v-login" @click="loginEvent('login')">登录&注册</span>
        <span v-if="mossCount !== '正在使用Key'">{{ mossNoLogin }}</span>
      </p>
    </div>
  </div>
</template>

<style lang="less">
.tip-main {
	width: 90%;
  display: flex;
  padding: 6px;
	border-radius: 6px;
	// background-color: #323232;
	margin: 0 auto;
  cursor: pointer;
  &:active {
		transform: scale(.96);
	}
	&:hover {
		// background-color: #3c4250;
	}
}
.v-login{
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size:12px;
	white-space: nowrap;
}
.v-exit{
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size:12px;
	margin-left: 10px;
	white-space: nowrap;
}
.number{
  color: #FF6666;
  cursor: grab;
  font-size:12px;
}
.notice-swipe {
  height: 40px;
  line-height: 40px;
}
.tip-text-content {
  font-size: 10px;
  width: 100%;
}
.van-notice-bar {
  width: 60%;
  background-color: #111114 !important;
  color: #fff;
  text-align: center;
  .van-notice-bar__wrap {
    display: flex;
    justify-content: center;
    .van-swipe-item {
      color: #FF6666;
      font-size: 10px;
    }
  }
}
</style>
