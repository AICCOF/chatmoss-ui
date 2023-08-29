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
const residueCountPay = computed(() => {
  if (userStore.balanceInfo && userStore.balanceInfo.residueCountPay) {
    const residueCount = userStore.balanceInfo.residueCountPay * 10
    return `${residueCount > 10000 ? `${(Math.floor(residueCount / 100) / 100).toFixed(2)}w` : residueCount}字符`
  }
  return '0'
})
const residueCountFree = computed(() => {
  if (userStore.balanceInfo && userStore.balanceInfo.residueCountFree) {
    const residueCountFree = userStore.balanceInfo.residueCountFree * 10
    return `${residueCountFree > 10000 ? `${(Math.floor(residueCountFree / 100) / 100).toFixed(2)}w` : residueCountFree}字符`
  }
  return '0'
})
function handleClose(goName: any) {
  // shopEvent()
  go({
    name: goName || 'shop',
  })
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
  <transition name="fade1">
    <header v-if="userStore.toggleValue" class="header-main">
      <div class="flex w-full header">
        <div class="header-left">
          <div class="tip-text-content1 cursor-pointer">
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
                <NButton quaternary circle size="tiny">
                  <template #icon>
                    <span class="">
                      <SvgIcon icon="uil:setting" class="icon" @click="settingMainEvent" />
                    </span>
                  </template>
                </NButton>
              </template>
              <span>设置中心</span>
            </NPopover>
          </div>
          <div class="header-right-item">
            <!-- 在线客服 -->
            <NPopover trigger="hover">
              <template #trigger>
                <a href="https://wpa1.qq.com/J3gC8UbU?_type=wpa&qidian=true" target="_blank">
                  <NButton quaternary circle size="tiny">
                    <template #icon>
                      <span class="">
                        <SvgIcon icon="uil:selfie" class="icon" />
                      </span>
                    </template>
                  </NButton>
                </a>
              </template>
              <span>在线客服</span>
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
              <div style="width: 300px; max-height: 648px;">
                <div v-for="(item, index) of userStore.getNotices" :key="index" class="notice">
                  <div class="flex-center" style="justify-content: space-between">
                    <div style="color: var(--n-text-color);; font-size: 16px; font-weight: 600; line-height: 22px">
                      {{ item.createTime }}
                    </div>
                    <div
                      v-if="item.content.length > 96" style="color: var(--moss-text); font-size: 12px"
                      class="cursor-pointer" @click="() => (item.unfold = !item.unfold)"
                    >
                      <div v-if="!item.unfold" class="flex-center">
                        <SvgIcon icon="ant-design:down-outlined" class="icon" />
                        <span style="margin-left: 10px">展开</span>
                      </div>

                      <div v-if="item.unfold" class="flex-center">
                        <SvgIcon icon="ant-design:up-outlined" class="icon" />
                        <span style="margin-left: 10px">收起</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="content" :class="[item.content.length > 96 && !item.unfold ? 'line' : '']">
                      {{ item.content }}
                    </div>
                  </div>
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
            <span class="shop" @click="shopEvent">商城</span>
          </div>
          <div v-if="userStore.isAuth === 2" class="header-left-item">
            <span class="invite" @click="() => { go({ name: 'invite' }) }">邀请得4.0</span>
          </div>
          <div v-if="userStore.isAuth === 2" class="header-left-item">
            <span class="sign" @click="() => { go({ name: 'sign' }) }">签到</span>
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

            <NPopover trigger="click" :duration="500" @update:show="() => userStore.getBalanceInfo()">
              <template #trigger>
                <div class="money">
                  余额
                </div>
              </template>
              <div
                v-for="(row, i) of userStore.packageList" :key="i"
                class="rounded-lg box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280] mt-2 "
              >
                <div>
                  <div class="flex justify-between">
                    <span class="mr-4">{{ row.title }}</span>
                    <span>可用次数：{{ row.timesResidue }}</span>
                  </div>
                </div>
                <div class="mt-2" style="overflow-y: auto;max-height: 66px;">
                  <div v-for="(item, i) of row.list" :key="i" class="">
                    <div class="mt-1 flex justify-between">
                      <span v-if="item.payType === 1" class="mr-1">付费：{{ item.totalTimes }}次；使用：{{ item.usedTimes
                      }}次</span>
                      <span v-if="item.payType === 0" class="mr-1">免费：{{ item.totalTimes }}次；使用：{{ item.usedTimes
                      }}次</span>
                      <NTag style="cursor: pointer;" type="success" size="small" round>
                        {{ item.residueDays === 0 ? "去购买" : `剩余${item.residueDays}天` }}
                      </NTag>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex rounded-full box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280]  mt-2">
                <div style="width:200px">
                  <span class="mr-4">免费字符数：{{ residueCountFree }}</span>
                </div>
              </div>
              <div class="flex rounded-full box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280]  mt-2">
                <div style="width:200px">
                  <span class="mr-4">付费字符数：{{ residueCountPay }}</span>
                </div>
              </div>
              <div class="flex  px-2 py-1  mt-2">
                <NButton style="margin-right: 20px;" text color="#ff69b4" @click="handleClose('shop')">
                  -> 去购买
                </NButton>
                <NButton text color="#ff69b4" @click="handleClose('detailedRule')">
                  余额使用规则
                </NButton>
              </div>
            </NPopover>
          </div>
          <activity v-model="modelValue" />
        </div>
      </div>
      <activity v-model="modelValue" />
    </header>
  </transition>
</template>

<style lang="less">
.notice {
  background-color: var(--moss-tip-bg-color);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;

  .content {
    display: -webkit-box;
    margin-top: 12px;
    overflow: hidden;
    color: var(--moss-text);
    font-size: 14px;
    text-align: justify;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;

    &.line {
      -webkit-line-clamp: 4;
      /* 显示3行 */
    }
  }
}

.header-main {
  width: 100%;
  min-width: 250px;
  overflow: auto;
  position: fixed;
  // height: 96px;
  align-items: center;
  user-select: none;
  z-index: 20;
  position: absolute;
  font-size: 14px;
  background-color: var(--moss-header-color);
  // background-color: rgba(28, 28, 30, .1);
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
  border-top: 0.5px solid var(--moss-border-color);
  border-bottom: 0.5px solid var(--moss-border-color);
  padding: 0 16px;
  height: 45px;
}

.chat-main {
  height: calc(100%);
  padding-top: 0px;
  padding-bottom: 10px;
  transition: all 0.3s;
}

.transition {
  transition: all 0.3s;
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
