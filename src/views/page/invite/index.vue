<script lang="ts" setup>
import { NDropdown, useMessage, NButton } from 'naive-ui'
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
import { ref } from 'vue'
import { copyText } from '@/utils/format'
const back = useBack()
const Message = useMessage()

let value = ref('')

function handleSelect() {
  copyText({ text: '' })
  Message.success('已复制到剪切板')
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="邀请" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>


    <div class="text-center">
      <div class="title">邀请朋友并赚取GPT-4.0信息</div>
      <div class="desc">为你和你的朋友赚取5个GPT4.0和50个GPT3.5查询</div>
      <div class="desc">推荐更过,赚的更多</div>
    </div>
    <van-cell-group title="邀请信息" inset>
      <van-cell>
        <!-- 使用 right-icon 插槽来自定义右侧图标 -->
        <template #title>
          https://vant-contrib.gitee.io/vant/#/zh-CN/cell
        </template>
        <template #right-icon>
          <van-button type="primary" size="mini" @click="handleSelect">复制</van-button>
        </template>
      </van-cell>
    </van-cell-group>

    <div class="">
      <div class="title">奖励</div>
      <div class="desc">GPT-4: 100</div>
      <div class="desc">GPT-3: 100</div>
    </div>

  </Page>
</template>

<style>
.title {
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #c9c9c9;
}

.desc {
  margin-top: 10px;
  font-size: 14px;
  color: #c9c9c9;
}
</style>