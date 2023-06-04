<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NLayoutSider, NPopconfirm , NButton, NInput, NModal, NCard } from 'naive-ui'
// import Tips from '../../tips.vue'

import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useGo } from '@/utils/router'
// const userStore = useUserStore()
const showModal = ref(false)
const sessionTitle = ref('')
const appStore = useAppStore()
const chatStore = useChatStore()
const go = useGo()
const isMobile = ref(true)
const collapsed = computed(() => appStore.siderCollapsed)

// 取消新建会话
function cancelModal() {
  showModal.value = false
  sessionTitle.value = ''
}

// 新建会话弹出modal
function createModal() {
  showModal.value = true
}

function handleAdd() {
	showModal.value = false
  chatStore.createChat(sessionTitle.value)
	console.log(showModal.value)
  sessionTitle.value = ''
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  return {
    position: 'fixed',
    zIndex: 50,
  }
})

const mobileSafeArea = computed(() => {
  return {
    paddingBottom: 'env(safe-area-inset-bottom)',
  }
})



function handleSettingSubmit() {
  go({name:'shop'})
}

// 个人中心
function myHomeSubmit() {
  // openModel()
  // person.value.updated()
  go({name:'setting'})
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
  <NLayoutSider :collapsed="collapsed" :collapsed-width="0" :width="200" show-trigger="arrow-circle"
    collapse-mode="transform" position="absolute" bordered :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed">
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div v-show="true" class="p-4">
          <div class="mb-2">
            <NButton id="question-btn"  dashed block @click="createModal">
              新建问题
            </NButton>
          </div>

          <NPopconfirm placement="bottom" @positive-click="()=> chatStore.deleteBatchHistory()">
            <template #trigger>
              <NButton id="question-btn2" dashed block @click.stop>
                批量删除
              </NButton>
            </template>
           确定进行此操作?
          </NPopconfirm>
          <NInput class="mt-4" v-model:value="chatStore.searchMsg" type="text" placeholder="搜索标题" />
        </div>

        <div class="flex-1 min-h-0 pb-12 overflow-hidden">
          <List />
        </div>
        <!-- 拓展功能区域 -->
        <div v-show="false" class="continuation">
          <div class="setting-main setting-main1" @click="myHomeSubmit">
            <div class="setting-text step6">
              个人中心
            </div>
          </div>
          <div class="setting-main setting-main2" @click="handleSettingSubmit">
            <div class="setting-text step5">
              ChatMoss商店
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
	<NModal v-model:show="showModal">
      <NCard
        style="width: 600px"
        title="创建会话"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <div>
          <span style="margin-right: 20px">会话名称:</span>
          <NInput v-model:value="sessionTitle" type="text" placeholder="请输入会话名称" style="width: 400px" />
        </div>
        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <NButton size="small" style="cursor: pointer;" @click="cancelModal">
              取消
            </NButton>
            <NButton type="primary" size="small" style="margin-left: 20px;cursor: pointer;" @click="handleAdd">
              确定
            </NButton>
          </div>
        </template>
      </NCard>
    </NModal>
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
  // background-color: #323232;
  margin: 0 auto;
  margin-bottom: 10px;

  &:active {
    transform: scale(.96);
  }

  &:hover {
    // background-color: #3c4250;
  }

  .setting-text {
    // color: rgba(232, 236, 239, 0.75);
    font-size: 10px;
  }

  .setting-btn {
    width: 20px;
    height: 20px;
    margin-left: 8px;
    margin-right: 12px;
  }
}

.title-h1 {
  margin: 10px 0px;
  color: #FF6666;
}

.title-h2 {
  color: #FF6666;
}

.tip-text-input1 {
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.tip-text-input2 {
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
  color: #FF6666;
  text-align: center;
}

.tip-text-input3 {
  font-size: 12px;
  margin-top: 20px;
  text-align: center;
}

.shop-img {
  min-width: 260px;
  min-height: 260px;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.n-card__content {}
</style>
