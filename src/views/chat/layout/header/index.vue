<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store'
const userStore = useUserStore()
import { getButtonList } from '@/api/application'
import { useGo } from '@/utils/router'
import {  NButton, NPopover, NTag } from 'naive-ui'
const go = useGo()
let tabList = ref([

])

getButtonListAPI()
async function getButtonListAPI() {
  let res = await getButtonList({
    type: 0
  });
  console.log(res)
  tabList.value = res.data || []
}

function handleLink(item) {
  // console.log(item)

  let json = JSON.parse(item.jumpUrl)

  if (json.type === 'path') {
    go({
      name: json.info.path
    })
  } else {
    go({
      name: 'h5',
      query: json.info
    })
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
</script>

<template>
  <transition name="fade1">
    <header v-if="userStore.toggleValue" class="header-main">
      <div class="relative" style="width: 100%;height: 100%;">
        <div style="width: 100%;height: 100%;overflow-y: scroll;">
          <div class="flex pl-[24px] pr-[80px] h-full" style="width: max-content;">
            <div v-for="(item, i) of tabList" :key="i" class="mr-[34px] flex items-center cursor-pointer"
              @click="handleLink(item)">
              <div>
                <img :src="item.iconUrl" class="w-[30px] h-[30px] m-auto" alt="">
                <div class="mt-[7px] text-center">{{ item.name }}</div>
              </div>

            </div>
          </div>
        </div>

      </div>
      <div class="absolute flex justify-center items-center money" style="right:0;top:0;width: 100px;height: 100%;">

        <NPopover trigger="click" :duration="500" @update:show="() => userStore.getBalanceInfo()">
          <template #trigger>
            <div class="btn flex justify-center items-center" style="width: 54px;
            height: 27px;
            font-size: 11px;
            font-weight: 600;
            color: #FFE69F;
            line-height: 15px;
            background: linear-gradient(90deg, #1F2654 0%, #2D3253 100%);
            border-radius: 13px;
        ">
              余额
            </div>
          </template>
          <div v-for="(row, i) of userStore.packageList" :key="i"
            class="rounded-lg box-border px-2 py-1 bg-[#f4f6f8] dark:bg-[#6b7280] mt-2 ">
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
    </header>
  </transition>
</template>

<style lang="less">
.money {

  background: linear-gradient(90deg, rgba(246, 247, 250, 0) 0%, rgba(246, 247, 250, 1) 20%, #F6F7FA 100%);
}

.dark {

  .money {
    background: linear-gradient(90deg, #16161600 0%, #161616 20%, #161616 100%);

  }
}

.header-main {
  height: 90px;
  width: 100%;
  display: flex;
  align-items: center;
  min-width: 250px;
  overflow: hidden;
  position: fixed;
  // height: 96px;
  align-items: center;
  user-select: none;
  z-index: 20;
  font-size: 14px;
  // background-color: var(--moss-header-color);
  // // background-color: rgba(28, 28, 30, .1);
  // color: var(--moss-text-blue-color);
  left: 0;
  top: 0;

}

.page .header {
  padding: 0px;
}
</style>
