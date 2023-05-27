<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import { useBack } from '@/utils/router'
import { ref } from 'vue'
import { NSpace, NButton, NForm, NFormItem, NInput, NSwitch, NSelect } from 'naive-ui'
const back = useBack()
const formValue = ref({})

function handleValidateButtonClick() {

}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="创建应用" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>

    <NSpace vertical class="mt-4">
      <NForm ref="formRef" :model="formValue">
        <n-form-item label="应用名称" path="user.name">
          <NInput v-model:value="formValue.name" placeholder="输入应用名称" />
        </n-form-item>
        <n-form-item label="应用描述" path="user.age">
          <NInput v-model:value="formValue.age" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5
            }" placeholder="输入应用描述" />
        </n-form-item>
        <NFormItem label="指令" path="user.phone">
          <n-input v-model:value="formValue.phone" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5
            }" placeholder="输入指令" />
        </NFormItem>
        <NFormItem label="应用类型" path="user.phone">
          <NSelect v-model:value="formValue.selectValue" placeholder="应用类型" :options="[]" />
        </NFormItem>

        <NFormItem label="发布商店" path="switchValue">
          <NSwitch v-model:value="formValue.switchValue" />
        </NFormItem>
        <NFormItem label="开启上下文" path="switchValue">
          <NSwitch v-model:value="formValue.switchValue" />
        </NFormItem>
      </NForm>

      <div>
        <NButton block type="primary" @click="handleValidateButtonClick">
          保存
        </NButton>
      </div>
    </NSpace>

  </Page>
</template>
