<script lang="ts" setup>
import { ref } from 'vue'
import { useBack } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
const back = useBack()

const url = ref(`https://h5.aihao123.cn/pages/app/study/index.html?token=${getToken()}&time=${new Date().getTime()}`)
</script>

<template>
  <iframe :src="url" frameborder="0" style="width:100%;height:100%;" />
</template>
