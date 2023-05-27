<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
const back = useBack()

</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="应用商店" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>
  
  </Page>
</template>
