<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { ref, onMounted, computed } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { copyText } from '@/utils/format'
import { getInviteInfo, InviteRes } from '@/api/invite'
const back = useBack()
const Message = useMessage()
import { getToken } from '@/store/modules/auth/helper'


const info = ref<InviteRes>()

const text = computed(() => {
  return `ChatMoss 是由 GPT-4 驱动的人工智能助手，现在注册赠送你 100 个免费 GPT 次数，包括 GPT-4，GPT-3.5，应用市场等。 快点击链接领取吧：${location.origin}/#/page/login?invite=${info.value?.inviteCode}`
})

const text1 = computed(() => {
  return `${location.origin}/#/page/login?invite=${info.value?.inviteCode}`
})

function handleSelect() {
  copyText({ text: text.value })
  Message.success('已复制链接')
}

// async function getInviteInfoAPI() {
//   let res = await getInviteInfo<InviteRes>()
//   info.value = res.data || {}
// }

onMounted(() => {
  // getInviteInfoAPI();
})
const url = ref(`http://h5.aihao123.cn/pages/app/invite/index.html?token=${getToken()}&time=${new Date().getTime()}`)

</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="back" />
    </template>
     <iframe :src="url" frameborder="0" style="border-radius: 10px;width:100%;height:100%;" />
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
  .t{
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
