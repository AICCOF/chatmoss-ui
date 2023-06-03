<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { ref, onMounted, computed } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { copyText } from '@/utils/format'
import { getInviteInfo, InviteRes } from '@/api/invite'
const back = useBack()
const Message = useMessage()


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
        <div class="">
          邀请朋友并赚取GPT-4.0信息
        </div>
        <div class="">
          为你和你的朋友赚取5个GPT4.0和50个GPT3.5查询
        </div>
        <div class="">
          你推荐越多,你赚的越多
        </div>
      </div>
      <van-cell-group title="邀请链接" inset>
        <van-cell>
          <!-- 使用 right-icon 插槽来自定义右侧图标 -->
          <template #title>
            <div class="url">
              {{ text1 }}
            </div>
          </template>
        </van-cell>
        <van-button type="primary" block size="mini" @click="handleSelect">
          复制
        </van-button>
      </van-cell-group>

      <div class="">
        <div class="title mt-4">
          奖励
        </div>
        <div class="mt-2">
          累计获得奖励{{ info['35TotalDays'] + info['40TotalDays'] }}天
        </div>
        <div class="flex justify-around mt-4">
          <div class="desc text-center">
            <div class="">
              <span class="h">{{ info['40Times'] }}</span>
              <span class="t">次</span>
            </div>
            <div>GPT 4.0</div>
          </div>
          <div class="desc text-center">
            <div class=" ">
              <span class="h">{{ info['35Times'] }}</span>
              <span class="t">次</span>
            </div>
            <div>GPT 3.5</div>
          </div>
        </div>
      </div>
    </div>
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
