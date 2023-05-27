<script lang="ts" setup>
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { copyText } from '@/utils/format'
const back = useBack()
const Message = useMessage()

const value = ref('')

function handleSelect() {
  copyText({ text: '' })
  Message.success('已复制到剪切板')
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="邀请" left-text="返回" left-arrow @click-left="back" />
    </template>

    <div class="invite-mian dark:text-white">
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
              https://vant-contrib.gitee.io/vant/#/zh-CN/cell
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
          累计获得奖励15天
        </div>
        <div class="desc">
          GPT 4.0: 100次/天
        </div>
        <div class="desc">
          GPT 3.5: 50次/天
        </div>
      </div>
    </div>
  </Page>
</template>

<style>
.url{
  width: 240px;
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
