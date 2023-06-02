<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { ref, onMounted } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { copyText } from '@/utils/format'
import { getInviteInfo, InviteRes } from '@/api/invite'
const back = useBack()
const Message = useMessage()


const info = ref<InviteRes>()

function handleSelect() {
  copyText({ text: info.value ? info.value.inviteCode : '' })
  Message.success('已复制到剪切板')
}
async function getInviteInfoAPI() {
  let res = await getInviteInfo<InviteRes>()
  info.value = res.data || {}
}

onMounted(() => {
  getInviteInfoAPI();
})
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="邀请" left-text="返回" left-arrow @click-left="back" />
    </template>

    <div class="invite-mian dark:text-white" v-if="info">
      <div class="text-center">
        <div class="title">
          邀请朋友并赚取GPT-4.0信息
        </div>
        <div class="desc">
          为你和你的朋友赚取5个GPT4.0和50个GPT3.5查询
        </div>
        <div class="desc">
          你推荐越多,你赚的越多
        </div>
      </div>
      <van-cell-group title="邀请链接" inset>
        <van-cell>
          <!-- 使用 right-icon 插槽来自定义右侧图标 -->
          <template #title>
            <div class="url">
              {{ info.inviteCode }}
            </div>
          </template>
          <template #right-icon>
            <van-button type="primary" size="mini" @click="handleSelect">
              复制
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="">
        <div class="title">
          奖励
        </div>
        <div class="">
          累计获得奖励{{ info['35TotalDays'] + info['40TotalDays'] }}天
        </div>
        <div class="desc">
          GPT 4.0: {{ info['40Times'] }}次/天
        </div>
        <div class="desc">
          GPT 3.5: {{ info['35Times'] }}次/天
        </div>
      </div>
    </div>
  </Page>
</template>

<style>
.url {
  width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #c9c9c9;
}

.desc {
  margin-top: 10px;
  font-size: 14px;
  /* color: #c9c9c9; */
}

.invite-mian {
  padding: 0 15px;
  padding-top: 20px;
  padding-bottom: 60px;
}
</style>
