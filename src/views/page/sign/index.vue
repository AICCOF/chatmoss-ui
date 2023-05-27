
<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
import {ref} from 'vue'
import { getToken } from '@/store/modules/auth/helper'
const back = useBack()

let url = ref(`https://h5.aihao123.cn/pages/app/signIn-new/index.html?token=${getToken()}&time=${new Date().getTime()}`)
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>
    <iframe :src="url" frameborder="0" style="width:100%;height:100%;" />
  </Page>
</template>
