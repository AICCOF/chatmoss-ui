<script lang="ts" setup>
import { NAlert,  NButton, NForm, NFormItem, NInput, NSpace, useMessage } from 'naive-ui'
import {  reactive} from 'vue'
import { getSystemNotice, sendFeedback } from '@/api/personCenter'
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
const back = useBack()
const ms = useMessage()

const feedBackForm = reactive({
  title: '',
  content: '',
})

async function sendFeedbackEvent() {
  await sendFeedback(feedBackForm)
  ms.success('我们确定问题之后，会为您下发10万字符奖励，感谢您的反馈。')
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="问题反馈" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>
     <NForm ref="formRef" :model="feedBackForm" :style="{ maxWidth: '640px' }" class="auto" style="margin:0 auto;">
          <NFormItem
            label="标题" path="title" :rule="{
                required: true,
                message: '请输入标题',
                trigger: ['input', 'blur'],
              }"
          >
            <NInput v-model:value="feedBackForm.title" placeholder="请输入标题" clearable />
          </NFormItem>
          <NFormItem
            label="内容" path="content" :rule="{
                required: true,
                message: '请详细描述您遇到的问题（2000字以内）',
                trigger: ['input', 'blur'],
              }"
          >
            <NInput
              v-model:value="feedBackForm.content" class="mt-4 mb-2" placeholder="请详细描述您遇到的问题（2000字以内）" type="textarea"
              style="border-radius: 0;height: 200px;"
            />
          </NFormItem>
          <NFormItem label="提示">
            <div style="width: 100%;">
              <div>
                <NAlert title="" type="info">
                  <div>
                    1.反馈意见可建issues：https://github.com/AICCOF/chatmoss-ui/
                  </div>
                  <div>
                    2.可使用第三方文档。如：掘金，语雀等。。。
                  </div>
                  <div>
                    3.我们确定问题之后，会为您下发10万字符奖励，感谢您的反馈。
                  </div>
                </NAlert>
              </div>
              <NSpace class="mt-4">
                <NButton attr-type="button" @click="sendFeedbackEvent">
                  提交
                </NButton>
              </NSpace>
            </div>
          </NFormItem>
        </NForm>

  </Page>
</template>
