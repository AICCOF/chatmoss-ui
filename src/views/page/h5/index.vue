<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
const router = useRouter()
const back = useBack()
console.log(router)

onMounted(() => {
})


const url = computed(() => {
  console.log(router.currentRoute)
  return `http://127.0.0.1:5173/pages/app/top-up/index.html?token=${getToken()}&time=${new Date().getTime()}`
  return `${router.currentRoute.value.query.url}?token=${getToken()}&time=${new Date().getTime()}`
})
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="back" />
    </template>
    <iframe :src="url" frameborder="0" style="width:100%;height:100%;" />
  </Page>
</template>

<style scoped lang="less">
.url {
  white-space: break-spaces;
  text-overflow: unset;
  word-break: break-all;

}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #c9c9c9;
}

.desc {
  margin-top: 10px;
  font-size: 14px;
  box-sizing: border-box;
  border: 1px solid #999;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;

  /* color: #c9c9c9; */
  .h {
    font-size: 26px;
  }

  .t {
    font-size: 12px;
    margin-left: 2px;
  }
}

.invite-mian {
  padding: 0 15px;
  padding-top: 20px;
  padding-bottom: 60px;
}
</style>
