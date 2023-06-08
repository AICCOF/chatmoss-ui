<script lang="ts" setup>
import { NAvatar, NButton, NPopover, NTag, useMessage, useNotification } from 'naive-ui'
import { computed, h, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import activity from './../activity.vue'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
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
const router = useRouter()
// interface Emit {
//   (e: 'login'): void
// }

function loginEvent(type: string) {
  if (type === 'login')
    go({ name: 'login', query: router.currentRoute.value.query })

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
        <div class="tip-text-content1">
          <p v-if="useAuthStore.token">
            <span @click="loginEvent('exit')">退出登录</span>
          </p>
          <p v-else>
            <span @click="loginEvent('login')">登录/注册</span>
          </p>
        </div>
      </div>
      <div class="header-right">
        <div class="header-right-item">
          <!-- 个人中心 -->
          <NPopover trigger="hover">
            <template #trigger>
              <NButton quaternary circle size="tiny" @click="settingMainEvent">
                <template #icon>
                  <span class="">
                    <SvgIcon icon="uil:setting" class="icon" />
                  </span>
                </template>
              </NButton>
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
                    <SvgIcon icon="ph:bell" class="icon" />
                  </span>
                </template>
              </NButton>
            </template>
            <div v-for="(item, index) of userStore.getNotices" :key="index" class="notice flex items-center mt-2"
              style="max-width: 250px">
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
              <NButton quaternary circle size="tiny" @click="() => { go({ name: 'help' }) }">
                <template #icon>
                  <span class="">
                    <SvgIcon icon="ph:question" class="icon" />
                  </span>
                </template>
              </NButton>
            </template>
            <span>ChatMoss帮助中心</span>
          </NPopover>
        </div>
      </div>

    </div>
    <div class="flex w-full sub-header">
      <div class="header-left">
        <div class="header-left-item">
          <span @click="shopEvent" class="shop">商城</span>
        </div>
        <div v-if="userStore.isAuth === 2" class="header-left-item">
          <span @click="() => { go({ name: 'invite' }) }" class="invite">邀请得4.0</span>
        </div>
        <div v-if="userStore.isAuth === 2" class="header-left-item">
          <span @click="() => { go({ name: 'sign' }) }" class="sign">签到</span>
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
        <div class="header-item-btn text-test text-test1">

          <!-- <div class="activity" v-if="useAuthStore.token">活动</div> -->

          <NPopover trigger="click" :duration="500" @update:show="() => userStore.residueCountAPI()">
            <template #trigger>
              <div class="money">余额</div>
            </template>
            <div v-for="(row, i) of userStore.packageList" :key="i"
              class="rounded-lg box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280] mt-2 ">
              <div>
                <div style="width:200px" class="flex justify-between">
                  <span class="mr-4">{{ row.title }}</span>
                  <span>可用次数：{{ row.timesResidue }}</span>
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
  width: 100%;
  min-width: 250px;
  overflow: scroll;
  position: fixed;
  // height: 96px;
  align-items: center;
  user-select: none;
  z-index: 20;
  position: absolute;
  font-size: 14px;
  background-color:var(--moss-header-color);
  color: var(--moss-text-blue-color);
  left: 0;
  top: 0;

  .header-right {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    img {
      width: 16px;
      height: 16px;
    }

    .header-right-item {
      margin: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      white-space: nowrap;

      &:active {
        transform: scale(.96);
      }

      .icon {
        font-size: 18px;
        color: var(--moss-text-blue-color);
      }
    }

  }

  .header-left {
    width: 50%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .header-left-item {
      margin-right: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      white-space: nowrap;

      .shop {
        color: var(--moss-text-purple-color)
      }

      .invite {
        color: var(--moss-text-green-color)
      }

      .sign {
        color: var(--moss-text-red-color)
      }
    }

  }
}

.header {
  padding: 0 16px;
  height: 45px;
}

.sub-header {
  border-top: 1px solid var(--moss-border-color);
  border-bottom: 0.5px solid var(--moss-border-color);
  padding: 0 16px;
  height: 45px;
}

.chat-main {
  height: calc(100%);
  padding-top: 90px;
  padding-bottom: 30px;
}

.header-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  // gap: 4px;
  font-size: 14px;
  height: 30px;
  padding: 0 6px;
  background-color: var(--moss-bg-text-color);
  color: var(--moss-text-blue-color);
  // opacity: 0.1;
  border-radius: 30px;
  padding: 9px 4px;
  cursor: pointer;

  .activity {
    padding-right: 12px;
    padding-left: 12px;
    border-right: 1px solid var(--moss-border-color);
  }

  .money {
    padding-left: 12px;
    padding-right: 12px;
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
