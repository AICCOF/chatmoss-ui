<script lang="ts" setup>
import { NPopover } from 'naive-ui'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useUserStore } from '@/store'
import { getToken } from '@/store/modules/auth/helper'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
import { localStorage } from '@/utils/storage/localStorage'
const emit = defineEmits<Emit>()
const useAuthStore = useAuthStoreWithout()

const userStore = useUserStore()
const chatStore = useChatStore()
const token = ref('')

interface Emit {
  (e: 'login'): void
}

function loginEvent(type: string) {
  if (type === 'login') {
    emit('login')
    const vLoginEle = document.querySelectorAll('.v-login')[0] as any
    vLoginEle.click()
  }
  if (type === 'exit') {
    const vExitEle = document.querySelectorAll('.v-exit')[0] as any
    vExitEle.click()
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
})

onMounted(() => {
  resetToken()
})

// 系统设置
function settingMainEvent() {
  const questionBtnDom = document.querySelector('.setting-main1') as HTMLDivElement
  questionBtnDom.click()
}
// ChatMoss商店
function shopEvent() {
  const questionBtnDom = document.querySelector('.setting-main2') as HTMLDivElement
  questionBtnDom.click()
}
</script>

<template>
  <header
    class="header-main"
  >
    <div class="header-right">
      <!-- <div class="header-right-item">
				<NPopover trigger="hover">
					<template #trigger>
						<img src="./img/img9.png" alt="">
					</template>
					<span>通知</span>
				</NPopover>
			</div> -->
      <div class="header-right-item">
        <NPopover trigger="hover">
          <template #trigger>
            <img src="./img/img10.png" alt="" @click="settingMainEvent">
          </template>
          <span>ChatMoss系统设置</span>
        </NPopover>
      </div>
      <div class="header-right-item">
        <NPopover trigger="hover">
          <template #trigger>
            <img src="./img/img8.png" alt="" @click="shopEvent">
          </template>
          <span>ChatMoss商店</span>
        </NPopover>
      </div>
    </div>
    <div class="header-left">
      <div class="tip-text-content step4">
        <p v-if="token">
          <span class="v-exit" @click="loginEvent('exit')">退出登录</span>
          剩余
          <span>{{ mossCount }}</span>
        </p>
        <p v-else>
          <span v-if="mossCount === '正在使用Key'">正在使用key</span>
          <span class="v-login" @click="loginEvent('login')">未登录</span>
          <span v-if="mossCount !== '正在使用Key'">{{ mossNoLogin }}</span>
        </p>
      </div>
    </div>
  </header>
</template>

<style lang="less">
.header-main {
	width: 100%;
	min-width: 350px;
	overflow: scroll;
	position: fixed;
	display: flex;
	align-items: center;
	height: 50px;
	min-height: 50px;
	max-height: 50px;
	padding: 0 16px;
	user-select: none;
	background-color: rgba(60, 128, 253, 0.3);
	z-index: 20;
	.header-left {
		width: 50%;
	}
	.header-right {
		width: 50%;
		display: flex;
		justify-content: flex-start;
		.header-right-item {
			margin-right: 20px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			&:active {
				transform: scale(.96);
			}
			img {
				width: 20px;
				height: 20px;
			}
		}
	}
}

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
}
.v-exit{
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size:12px;
	margin-left: 10px;
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
