<script lang="ts" setup>
import { NAvatar, NButton, NPopover, NTag, useMessage, useNotification } from 'naive-ui'
import { computed, h, onMounted, ref, watchEffect } from 'vue'
import activity from './../activity.vue'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
import { staticData } from '@/store/static'
import { useGo } from '@/utils/router'
import { getSystemNotice } from '@/api/personCenter'
import type { Notice } from '@/store/modules/user/helper'
const Message = useMessage()
// const emit = defineEmits<Emit>()
const useAuthStore = useAuthStoreWithout()

const userStore = useUserStore()
const chatStore = useChatStore()
const notification = useNotification()
const go = useGo()
const modelValue = ref(false)
import { useRouter } from 'vue-router'
let router = useRouter();
// interface Emit {
//   (e: 'login'): void
// }

function loginEvent(type: string) {
  if (type === 'login')
    go({ name: 'login' , query: router.currentRoute.value.query })

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
  return `${residueCount > 10000 ? `${(Math.floor(residueCount / 100) / 100).toFixed(2)}w` : residueCount}字符`
})
function handleClose(row: any) {
  shopEvent()
}


watchEffect(() => {
  const { user } = userStore.userInfo
  if (user.email)
  // resetToken()
  {
    if (userStore.isAuth === 3) {
      useAuthStore.setToken('')
      sendToMsg('chatMossToken', '')
      chatStore.clearList()
      userStore.residueCountAPI()
      Message.error('登录已过期,请重新登录')
    }
  }
})

onMounted(() => {
  // resetToken()
  getSystemNoticeAPI()
})
const temNotice = computed(() => userStore.getNotices || [])
async function getSystemNoticeAPI() {
  const res = await getSystemNotice<Notice[]>()

  const notice = res.data[0]

  if (res.data.length > temNotice.value.length) {
    notification.create({
      content: notice.content,
      meta: notice.createTime,
      avatar: () =>
        h(NAvatar, {
          size: 'small',
          round: true,
          src: notice.icon,
        }),
      duration: 5000,
      keepAliveOnHover: true,
    })
  }
  userStore.setNotices(res.data)
}

// 系统设置
function settingMainEvent() {
  go({ name: 'setting' })
}
// ChatMoss商店
function shopEvent() {
  go({ name: 'shop' })
}
</script>

<template>
  <header class="header-main">
    <div class="flex w-full header">
      <div class="header-left">
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
          <NPopover style="max-height: 340px" trigger="click" scrollable to="body">
            <template #trigger>
              <NButton quaternary circle size="tiny">
                <template #icon>
                  <span class="">
                    <SvgIcon icon="mdi:message-badge-outline" />
                  </span>
                </template>
              </NButton>
            </template>
            <div
              v-for="(item, index) of userStore.getNotices" :key="index" class="notice flex items-center mt-2"
              style="max-width: 250px"
            >
              <div class="mr-4 " style="width:30px">
                <img :src="item.icon" style="width:30px" class="circle" alt="">
              </div>
              <div class="flex-1">
                <div> {{ item.content }}</div>
                <div>{{ item.createTime }}</div>
              </div>
            </div>
          </NPopover>
        </div>

        <div class="header-right-item header-right-item-help">
          <NPopover trigger="hover">
            <template #trigger>
              <img
                src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v3.0/img12.png" alt=""
                @click="() => { go({ name: 'help' }) }"
              >
            </template>
            <span>ChatMoss帮助中心</span>
          </NPopover>
        </div>
      </div>
      <div class="header-right">
        <div class="tip-text-content tip-text-content1">
          <p v-if="useAuthStore.token">
            <span class="v-exit" @click="loginEvent('exit')">退出登录</span>
          </p>
          <p v-else>
            <span class="v-login" @click="loginEvent('login')">登录&注册</span>
          </p>
        </div>
      </div>
    </div>
    <div class="flex w-full sub-header">
      <div class="header-left">
        <div class="header-right-item">
          <span @click="shopEvent">商城</span>
        </div>
        <div v-if="userStore.isAuth === 2" class="header-right-item">
          <span @click="() => { go({ name: 'invite' }) }">邀请</span>
        </div>
        <div v-if="userStore.isAuth === 2" class="header-right-item">
          <span @click="() => { go({ name: 'sign' }) }">签到</span>
        </div>
      </div>
      <div class="header-right">
        <!-- <div class="tip-text-content">
          <p v-if="useAuthStore.token" @click="getActivityListEvent">
            <NButton round secondary type="success" size="tiny" @click="clickActivity">
              活动
            </NButton>
          </p>
        </div> -->
        <div class="header-right-item header-item-btn text-test text-test1">
          <NPopover trigger="click" :duration="500" @update:show="() => userStore.residueCountAPI()">
            <template #trigger>
              余额
            </template>
            <div
              v-for="(row, i) of userStore.packageList" :key="i"
              class="rounded-lg box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280] mt-2 "
            >
              <div>
                <div style="width:200px" class="flex justify-between">
                  <span class="mr-4">{{ row.title }}</span>
                  <span> 可用次数：{{ row.timesResidue }}</span>
                </div>
              </div>
              <div class="mt-2 ">
                <div v-for="(item, i) of row.list" :key="i" class="">
                  <div class="mt-1 flex justify-between">
                    <span class="mr-1">{{ item.title }}</span>

                    <NTag style="cursor: pointer;" type="success" size="small" round @click="handleClose(row)">
                      {{ item.day === 0 ? "去购买" : `剩余${item.day}天` }}
                    </NTag>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex rounded-full box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280]  mt-2">
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
        <activity v-model="modelValue" />
      </div>
    </div>
    <activity v-model="modelValue" />
  </header>
</template>

<style lang="less">
.header-main {
  // max-width: 1280px;
  width: 100%;
  min-width: 250px;
  overflow: scroll;
  position: fixed;
  align-items: center;
  // padding: 0 16px;
  user-select: none;
  backdrop-filter: blur(20px);
  background-color: rgba(60, 128, 253, 0.1);
  z-index: 20;
  position: absolute;
  left: 0;
  top: 0;

  .header-right {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .header-left {
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
			font-size: 12px;

      &:hover {
        transform: scale(1.05);
        font-weight: 600;
        color: #3c72ff;
      }

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

.header {
  padding: 0 16px;
  height: 45px;
}

.sub-header {
  border-top: 1px solid #242627;
  padding: 0 16px;
  height: 45px;
}

.chat-main {
  height: calc(100%);
  padding-top: 90px;
  padding-bottom: 30px;
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

.page .header {
  padding: 0px;
}
</style>
