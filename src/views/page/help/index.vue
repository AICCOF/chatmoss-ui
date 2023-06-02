<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
const back = useBack()

</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>
    <iframe src="https://h5.aihao123.cn/pages/app/help/index.html" frameborder="0" style="width:100%;height:100%;" />
  </Page>
</template>