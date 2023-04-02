<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NInput, NLayoutSider, NModal, useMessage } from 'naive-ui'
import Tips from '../../tips.vue'
import List from './List.vue'
import Footer from './Footer.vue'
import Login from '@/views/login/index.vue'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const userStore = useUserStore()
const showModal = ref(false)
const ms = useMessage()
const appStore = useAppStore()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: '新建问题', uuid: Date.now(), isEdit: false })
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

// 设置内容
const showSettingModal = ref(false)
function handleSettingSubmit() {
  if (!localStorage.getItem('SECRET_TOKEN')) {
    ms.info('请先登录~', { duration: 5000 })
    return
  }
  showSettingModal.value = true
}
const apiKey = ref(localStorage.getItem('apiKey')) as any
function settingBtn() {
	if (apiKey.value === '' || apiKey.value.startsWith('sk-')) {
    localStorage.setItem('apiKey', apiKey.value)
    showSettingModal.value = false
    ms.info('设置成功~', { duration: 5000 })
  }
  else {
    ms.error('正确的key是以sk-开头的', { duration: 5000 })
  }
}
// 个人中心
function myHomeSubmit() {
  ms.info('正在开发中~本周发布', { duration: 5000 })
}

// 登录注册功能
function showModelEvent() {
  showModal.value = true
}
function handleSubmit() {
  showModal.value = false
  userStore.residueCountAPI()
}

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="200"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NButton id="question-btn" dashed block @click="handleAdd">
            新建问题
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <!-- 拓展功能区域 -->
        <div class="continuation">
          <div class="setting-main" @click="myHomeSubmit">
            <img class="setting-btn" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/icon2.png" alt="">
            <div class="setting-text">
              个人中心
            </div>
          </div>
          <div class="setting-main" @click="handleSettingSubmit">
            <img class="setting-btn" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/icon3.png" alt="">
            <div class="setting-text">
              设置ApiKey
            </div>
          </div>
          <Tips @login="showModelEvent" />
        </div>
        <!-- 设置key功能 -->
        <NModal v-model:show="showSettingModal">
          <NCard
            style="width: 600px"
            title="设置ApiKey"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            <NInput v-model:value="apiKey" type="text" placeholder="请输入您的apiKey" />
            <NButton class="mt10" type="primary" ghost @click="settingBtn">
              确定
            </NButton>
            <hr class="line">
            <div>如何获得key</div>
            <div>最便捷 购买ChatMoss官方key | 自动发货 | <span class="color">支付宝 扫码购买</span></div>
            <img width="150" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v1.3/zfbgm.png" alt="">
            <div class="tip-text">
              全网都没新key了，这里存货卖完也不卖了，感谢大家的支持
            </div>
            <hr class="line">
            <div>其他获取key的方式</div>
            <div>注册OpenAi账号，访问这里即可：https://platform.openai.com/account/billing/overview</div>
          </NCard>
        </NModal>
        <!-- 登录注册功能 -->
        <NModal v-model:show="showModal" transform-origin="center">
          <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <Login @loginSuccess="() => { handleSubmit() }" />
          </NCard>
        </NModal>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
</template>

<style lang="less">
.continuation {
	margin-bottom: 20px;
	margin-top: 5px;
}
.setting-main {
	width: 90%;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px;
	border-radius: 6px;
	background-color: #323232;
	margin: 0 auto;
	margin-bottom: 10px;
  &:active {
      transform: scale(.96);
  }
	&:hover {
		background-color: #3c4250;
	}
  .setting-text {
    color: rgba(232, 236, 239, 0.75);
    font-size: 10px;
  }
  .setting-btn {
    width: 20px;
    height: 20px;
		margin-left: 8px;
		margin-right: 12px;
  }
}
</style>
