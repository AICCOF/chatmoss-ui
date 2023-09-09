<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store'
const userStore = useUserStore()
import { getButtonList } from '@/api/application'
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


</script>

<template>
  <transition name="fade1">
    <header v-if="userStore.toggleValue" class="header-main">
      <div class="relative" style="width: 100%;height: 100%;">
        <div style="width: 100%;height: 100%;overflow-y: scroll;">
          <div class="flex pl-[24px] pr-[80px] h-full" style="width: max-content;">
            <div v-for="(item, i) of tabList" :key="i" class="mr-[36px] flex items-center">
              <div>
                <img :src="item.iconUrl" class="w-[36px] h-[36px] m-auto" alt="">
                <div class="mt-[7px] text-center">{{ item.name }}</div>
              </div>

            </div>
          </div>
        </div>

      </div>
      <div class="absolute flex justify-center items-center money" style="right:0;
            top:0;width: 100px;height: 100%;">
        <div class="flex justify-center items-center" style="width: 54px;
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
