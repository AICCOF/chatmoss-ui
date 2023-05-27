<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
const back = useBack()

</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="应用列表" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>

    <div class="mt-4  flex-1 pl-4 w-full">

      <div class="flex justify-between items-center  dark:text-white w-full flex-1" v-for="item of 6">
        <div class="flex items-center flex-1">
          <div class="mr-2">
            <img src="./../../chat/img/icon1.png" alt="" style="width:30px;height: 30px;">
          </div>
          <div class="flex flex-1 w-full">
            <span class="mr-2 flex justify-center text-base" style="width:30px">1</span>
            <div class="w-full pr-4 flex-1">
              <div class="flex  items-center w-full">
                <span class="text-base mr-4">title</span>
                <span>
                  <!-- <van-icon name="like-o" style="color:red;" /> -->
                  <van-icon name="like" style="color:red;" /><span>123</span>
                </span>
              </div>
              <div class="text-sm">desc</div>
            </div>
          </div>
        </div>
        <div>
          <van-button type="primary" size="mini" class="mr-2">编辑</van-button>
          <van-button type="primary" size="mini">删除</van-button>
        </div>
      </div>

    </div>

  </Page>
</template>
