<script lang="ts" setup>
import { NButton, NPopover, NTag } from 'naive-ui'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useUserStore } from '@/store'
import { getToken } from '@/store/modules/auth/helper'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
import { staticData } from '@/store/static'
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
  return `${residueCount > 10000 ? `${(Math.floor(residueCount / 100) / 100).toFixed(2)}w` : residueCount}字符`
})
// // 未登录状态下描述
// const mossNoLogin = computed(() => `还可试用${userStore.userInfo.residueCount * 10}字符`)
function handleClose(row: any) {
  shopEvent()
}

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
  <header class="header-main">
    <div class="header-right">
      <div class="header-right-item">
        <!-- 个人中心 -->
        <NPopover trigger="hover">
          <template #trigger>
            <img :src="staticData.img4" alt="" @click="settingMainEvent">
          </template>
          <span>设置中心</span>
        </NPopover>
      </div>
      <div class="header-right-item">
        <!-- 商店 -->
        <NPopover trigger="hover">
          <template #trigger>
            <img :src="staticData.img6" alt="" @click="shopEvent">
          </template>
          <span>ChatMoss商店</span>
        </NPopover>
      </div>
    </div>
    <div class="header-left">
      <div class="tip-text-content">
        <p v-if="token">
          <span class="v-exit" @click="loginEvent('exit')">退出登录</span>
        </p>
        <p v-else>
          <span class="v-login" @click="loginEvent('login')">登录&注册</span>
        </p>
      </div>
      <div class="header-right-item header-item-btn text-test">
        <NPopover trigger="hover" :duration="1500">
          <template #trigger>
            余额
          </template>
          <div
            v-for="(row, i) of userStore.packageList" :key="i"
            class="rounded-lg box-border px-2 py-1 bg-gray-500/80 mt-2 "
          >
            <div>
              <div style="width:200px" class="flex justify-between">
                <span class="mr-4">{{ row.title }}</span>
                <span> 当日可用次数：{{ row.timesResidue }}</span>
              </div>
            </div>
            <div class="mt-2 ">
              <div v-for="(item, i) of row.list" :key="i" class="">
                <div class="mt-1 flex justify-between">
                  <span class="mr-1">{{ item.title }}</span>
                  <NTag class="cursor-pointer pointer" type="success" size="small" round @click="handleClose(row)">
                    {{ item.day === 0 ? "去购买" : `剩余${item.day}天` }}
                  </NTag>
                </div>
              </div>
            </div>
          </div>

          <div class="flex rounded-full box-border px-2 py-1 bg-gray-500/80 mt-2">
            <div style="width:200px">
              <span class="mr-4">字符数：{{ mossCount }}</span>
            </div>
          </div>
          <div class="flex  px-2 py-1  mt-2">
            <NButton text color="#ff69b4" @click="handleClose">
              +更多
            </NButton>
          </div>
        </NPopover>
      </div>
    </div>
  </header>
</template>

<style lang="less">
.header-main {
  max-width: 1280px;
  width: 100%;
  min-width: 250px;
  overflow: scroll;
  position: fixed;
  display: flex;
  align-items: center;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 0 16px;
  user-select: none;
  backdrop-filter: blur(20px);
  background-color: rgba(60, 128, 253, 0.1);
  z-index: 20;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  .header-left {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .header-right {
    width: 50%;
    display: flex;
    justify-content: flex-start;

    .header-right-item {
      margin-right: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

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

.header-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  height: 26px;
  padding: 0 6px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: #3872e0;
  cursor: pointer;
}

.text-test {
  white-space: nowrap;
  width: 50px;
  height: 20px;
  background-color: #ceeaca;
  color: #4fa444;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  text-transform: capitalize;
  font-weight: 500;
  border-radius: 40px;
  gap: 2px;
  margin-right: 0px;
  cursor: pointer;
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

.v-login {
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size: 12px;
  white-space: nowrap;
}

.v-exit {
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size: 12px;
  margin-left: 10px;
  white-space: nowrap;
}

.number {
  color: #FF6666;
  cursor: grab;
  font-size: 12px;
}

.notice-swipe {
  height: 40px;
  line-height: 40px;
}

.tip-text-content {
  font-size: 10px;
  width: auto;
  margin-right: 16px;
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
.pointer {
	cursor: pointer;
}
.t-input1 {
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
	margin-left: 10px;
}
</style>
