<script lang="ts" setup>
import draggable from 'vuedraggable'
import { nextTick, ref } from 'vue'
import { showConfirmDialog } from 'vant'
import { NPopover, useMessage } from 'naive-ui'
import { useGo } from '@/utils/router'
import { getApplicationInstall, getApplicationSort } from '@/api/application'
import { useChatStore, useUserStore } from '@/store'

const ms = useMessage()

const go = useGo()
const userStore = useUserStore()
const chatStore = useChatStore()
const enabled = ref(false)

const deleteItem = ref([])

userStore.getApplicationInstallListAPI()

function handleEdit() {
  enabled.value = true
}
function handleClick(row) {
  
  if (!enabled.value && userStore.appIdValue !== row.appId) {
    if (row.isOpened === 0) {
      ms.info(row.notOpenReason || '暂未开放，敬请期待...')
      return
    }
    userStore.setAppId(row.appId)
    nextTick(() => {
      chatStore.chatList()
      // ms.warning('切换应用成功,请新建会话或者选中历史会话在提问')
    })
  }
}
function handleDelete(row, i) {
  deleteItem.value.push(row.appId)
  userStore.appList.installList.splice(i, 1)
}

function handleSave() {
  showConfirmDialog({
    title: '保存',
    message:
      '确定进行此操作?',
  })
    .then(async () => {
      // on confirm
      const data = userStore.appList.installList.map((row, index) => {
        return {
          appId: row.appId,
          sort: index + 1,
        }
      })
      const res = await getApplicationSort(data)
      // console.log(deleteItem)
      if (deleteItem.value.length > 0) {
        await getApplicationInstall({
          appId: deleteItem.value.join(','),
          type: 0,
        })
      }

      deleteItem.value = []
      userStore.getApplicationInstallListAPI()
      // showToast(res.msg)
    })
    .catch(() => {
      // on cancel
    })

  enabled.value = false
}
</script>

<template>
  <div class="wrap">
    <div class="list">
      <draggable :list="userStore.appList.systemList" :disabled="true" item-key="name" class="list-group"
        ghost-class="ghost">
        <template #item="{ element }">
          <div class="img" :class="[userStore.appIdValue === element.appId ? 'active' : '']"
            @click="handleClick(element)">

            <div>
              <NPopover trigger="hover">
                <template #trigger>
                  <img :src="element.iconUrl" alt="">
                  <!-- <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo/s-logo1.png" alt=""> -->
                </template>
                <span>{{ element.appName }}</span>
              </NPopover>
            </div>
            <div class="span">{{ element.appName.length > 5 ? element.appName.slice(0, 5) :
              element.appName }}</div>
          </div>
        </template>
      </draggable>
      <draggable :list="userStore.appList.installList" :disabled="!enabled" item-key="name" class="list-group"
        ghost-class="ghost">
        <template #item="{ element, index }">
          <div class="img" :class="[userStore.appIdValue === element.appId ? 'active' : '']"
            @click="handleClick(element)">
            <span v-if="enabled" class="close" @click="handleDelete(element, index)">
              <van-icon class="close-icon" name="cross" />
            </span>
            <div :class="[enabled ? 'animate-pulse animate' : '']">
              <NPopover trigger="hover">
                <template #trigger>
                  <img :src="element.iconUrl" alt="">
                  <!-- <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo/logo1.png" alt=""> -->
                </template>
                <span>{{ element.appName }}</span>
              </NPopover>
            </div>
            <div class="span">{{ element.appName.length > 5 ? element.appName.slice(0, 5) :
              element.appName }}</div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="btns">
      <div class="btn">
        <van-icon v-if="!enabled" name="edit" @click="() => handleEdit()" />
        <span v-if="enabled" style="font-size: 12px;" @click="() => handleSave()">保存</span>
      </div>
      <div class="btn">
        <!-- <van-icon name="plus" @click="() => { go({ name: 'application' }) }" /> -->
        <img class="btn-icon" src="./img/appstore.png" alt="" @click="() => { go({ name: 'application' }) }">
      </div>
    </div>
  </div>
</template>


<style scoped lang="less">
.wrap {
  height: 100%;
  width: 71px;
  border-right: 0.5px solid rgba(145, 158, 171, .16);
  border-bottom: 0.5px solid rgba(145, 158, 171, .16);
  box-sizing: border-box;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  display: flex;
  flex-direction: column;


  .list {
    overflow: auto;
    // width: 71px;
    height: 80%;
    flex:1;

    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      /**/
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #bfbfbf;
      border-radius: 10px;
    }

    .img {
      margin: 0 auto;
      position: relative;
      width: 100%;
      // height: 45px;
      padding: 10px 0;
      background-color: var(--moss-header-color);
      border-radius: 4px;
      // display: flex;
      // align-items: center;
      // justify-content: center;
      cursor: pointer;

      img {
        width: 26px;
        height: 26px;
        margin: 0 auto;
      }

      &.active {
        background-color: var(--moss-bg-content-color)
      }

      .animate {
        animation-duration: 0s !important;
      }

      .close {
        position: absolute;
        top: -10px;
        left: 5px;

        .close-icon {
          background: rgba(255, 255, 255, .3);
          border-radius: 50%;
          padding: 1px;
          top: 10px;
          left: 0;
          transform: scale(0.8);
        }
      }

      .span {
        // position: absolute;
        width: 100%;
        opacity: 0.8;
        font-size: 8px;
        // transform: scale(0.6);
        text-align: center;
        opacity: .9;
        font-weight: 600;
      }

    }
  }

  .btns {
    // height:;
    // width: 71px;
    background-color: var(--moss-header-color);
    font-size: 24px;
    font-size: 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .btn {
      width: 100%;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .btn-icon {
        width: 26px;
        height: 26px;
      }

      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1),
      inset 0px 1px 0px rgba(255, 255, 255, 0.05);
    }
  }

}</style>
