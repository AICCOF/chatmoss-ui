<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
// import Tips from '../../tips.vue'
import { Drawer, Input, Tooltip } from 'ant-design-vue'
import List from './List.vue'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useGo } from '@/utils/router'
import { useScroll } from './../../hooks/useScroll'
let hover = ref({})
// const userStore = useUserStore()
// const showModal = ref(false)
const appStore = useAppStore()
const chatStore = useChatStore()
import { useTheme } from '@/hooks/useTheme'
const { vantTheme } = useTheme()
const go = useGo()
const isMobile = ref(true)
const collapsed = computed(() => appStore.siderCollapsed)
const batchDelete = ref(false);
const { resetValue } = useScroll()
function handleAdd() {
  chatStore.createChat()
  resetValue()
}

function handleDelete() {
  batchDelete.value = true;
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function handleCancel() {
  batchDelete.value = false
}

async function handleSave() {
  await chatStore.deleteBatchHistory()
  batchDelete.value = false
}

</script>

<template>
  <Drawer class="my-drawer" placement="bottom" :visible="appStore.siderCollapsed" @close="handleUpdateCollapsed"
    height="65vh" :z-index="1100">
    <template #extra>
    </template>
    <template #title>历史记录</template>
    <div class="flex px-[33px]">
      <div class="flex-1 mr-[11px] input-history"
        :class="[hover.search ? 'border-[#3875F6] dark:border-[#7569FF] ' : 'border-[#C7CDE5] text-[#FFFFFF]']"
        @mouseleave="() => {
          hover.search = false
        }" @mouseenter="() => { hover.search = true }">

        <div v-if="vantTheme === 'light'">
          <img src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-search.png"
            class="input-search" v-show="!hover.search" alt="">
          <img v-show="hover.search"
            src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-search_active.png"
            class="input-search" alt="">
        </div>
        <div v-if="vantTheme === 'dark'">
          <img src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-search.png"
            class="input-search" v-show="!hover.search" alt="">
          <img v-show="hover.search"
            src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-search_active.png"
            class="input-search" alt="">
        </div>

        <input type="text" class="text-[#1a1a1a] dark:text-[#fff]  " v-model="chatStore.searchMsg" placeholder="搜索标题">
      </div>
      <div class="w-[32px] mr-[11px]" @click="handleAdd" @mouseleave="() => {
        hover.add = false
      }" @mouseenter="() => { hover.add = true }">

        <Tooltip z-index="10000">
          <template #title>新建回话</template>
          <div v-if="vantTheme === 'light'">
            <img v-show="!hover.add"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-add.png" alt="">
            <img v-show="hover.add"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-add_active.png" alt="">
          </div>
          <div v-if="vantTheme === 'dark'">
            <img v-show="!hover.add"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-add.png" alt="">
            <img v-show="hover.add"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-add_active.png" alt="">
          </div>
        </Tooltip>

      </div>
      <div class="w-[32px]" @mouseleave="() => {
        hover.delete = false
      }" @mouseenter="() => { hover.delete = true }" @click="handleDelete">

        <Tooltip z-index="10000">
          <template #title>批量删除</template>
          <div v-if="vantTheme === 'light'">
            <img v-show="!hover.delete"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-delete_all.png" alt="">
            <img v-show="hover.delete"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/light/history/icon-delete_all_active.png"
              alt="">
          </div>
          <div v-if="vantTheme === 'dark'">
            <img v-show="!hover.delete"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-delete_all.png" alt="">
            <img v-show="hover.delete"
              src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/dark/history/icon-delete_all_active.png"
              alt="">
          </div>
        </Tooltip>


      </div>
    </div>
    <List :is-delete="batchDelete" @cancel="handleCancel" @save="handleSave"></List>
  </Drawer>
</template>

<style lang="less">
.input-history {
  height: 32px;
  // background: #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  padding-left: 30px;
  position: relative;
  border-width: 1px;
  border-style: solid;
  // border: 1px solid #C7CDE5;

  .input-search {
    position: absolute;
    top: 0%;
    left: 0%;
    margin-top: 8px;
    margin-left: 8px;
    width: 16px;
  }

  input {
    width: 100%;
    height: 100%;
    font-size: 14px;
    border-radius: 5px;
    font-weight: 400;
    // color: #C9CDDB;
    background-color: transparent;

    line-height: 20px;

    &::placeholder {
      color: #c9cddb;
    }

  }

  .dark {
    input {
      &::placeholder {
        color: #69696a;
      }

    }
  }
}

.continuation {
  margin-bottom: 20px;
  margin-top: 5px;
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
