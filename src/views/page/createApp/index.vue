<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSelect, NSpace, NSwitch } from 'naive-ui'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
const back = useBack()
const formValue = ref({})

function handleValidateButtonClick() {

}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="创建应用" left-text="返回" left-arrow @click-left="back" />
    </template>

    <NSpace vertical class="create-store-main mt-4">
      <NForm ref="formRef" :model="formValue">
        <NFormItem label="应用名称" path="user.name">
          <NInput v-model:value="formValue.name" placeholder="输入应用名称" />
        </NFormItem>
        <NFormItem label="应用描述" path="user.age">
          <NInput
            v-model:value="formValue.age" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5,
            }" placeholder="输入应用描述"
          />
        </NFormItem>
        <NFormItem label="指令" path="user.phone">
          <NInput
            v-model:value="formValue.phone" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5,
            }" placeholder="输入指令"
          />
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

<style scoped lang="less">
.create-store-main {
	padding: 0 15px;
	padding-top: 20px;
	padding-bottom: 60px;
}
</style>
