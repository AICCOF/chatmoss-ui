<script lang="ts" setup>
import { ref , computed } from 'vue'
import { useBack } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
const back = useBack()
import { jumpLink, replaceDom } from '@/utils/jumpLink'
import { useAppStore, useUserStore } from '@/store'
const userStore = useUserStore()

userStore.getRedCountAPI()
const url = computed(() => {
  // console.log(router.currentRoute)
  let dom = 'https://h5.aihao123.cn/pages/app/notice/index.html'

  dom = replaceDom(dom)
  return `${dom}?token=${getToken()}&time=${new Date().getTime()}`
})
</script>

<template>
  <iframe :src="url" frameborder="0" style="width:100%;height:100%;" />
</template>
