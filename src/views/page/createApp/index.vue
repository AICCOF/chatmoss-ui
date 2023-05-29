<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSelect, NSpace, NSwitch } from 'naive-ui'
import { FormInst, FormItemRule, useMessage } from 'naive-ui'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { getApplicationIconList, getApplicationCreate, getApplicationTypeList, getApplicationQueryById, getApplicationUpdate } from '@/api/application'
import { useRouter } from 'vue-router'
const router = useRouter();
const back = useBack()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
let title = ref('')
const formValue = ref({
  iconUrl: '',
  share: 1,
  contextEnabled: 1
})
let rules = {
  iconId: {
    required: true,
    message: '输入选择图标',
  },
  appName: {
    required: true,
    message: '输入应用名称',
  },
  desc: {
    required: true,
    message: '输入应用描述',
  },
  promot: {
    required: true,
    message: '输入指令',
  },
  appType: {
    required: true,
    message: '请选择应用类型',
  }
};
const showBottom = ref(false)
let iconList = ref([])
let typeList = ref([])
function handleValidateButtonClick() {
  formRef.value?.validate((errors) => {
    console.log(errors)
    if (!errors) {
      if (formValue.value.id) {
        getApplicationUpdateAPI()
      } else {
        getApplicationCreateAPI();
      }

    }
  })

}

getApplicationListAPI();
getApplicationTypeListAPI();
async function getApplicationTypeListAPI() {
  let res = await getApplicationTypeList();
  typeList.value = (res.list || []).map(row => {
    return {
      label: row.typeName,
      value: row.id
    }
  })
}
async function getApplicationListAPI() {
  let res = await getApplicationIconList();
  // console.log(iconList, res)
  formValue.value.iconUrl = res.rows[0] ? res.rows[0].url : ''
  formValue.value.iconId = res.rows[0] ? res.rows[0].id : ''
  iconList.value = res.rows || []

}

async function getApplicationCreateAPI() {
  let res = await getApplicationCreate(formValue.value);
  back();
  message.success(res.msg)
}
async function getApplicationUpdateAPI() {
  let res = await getApplicationUpdate(formValue.value);
  back();
  message.success(res.msg)
}
function handleImage(row) {

  formValue.value.iconUrl = row.url
  formValue.value.iconId = row.id
  showBottom.value = false;
}
onMounted(async () => {

  if (router.currentRoute.value.query) {
    let id = router.currentRoute.value.query.id
    if (id) {
      title.value = '编辑应用'
      let res = await getApplicationQueryById(id)
      let data = res.data || {}
      formValue.value = {
        id: data.id,
        iconId: data.iconId,
        iconUrl: data.icon,
        appName: data.appName,
        appType: data.appType,
        desc: data.desc,
        promot: data.promot,
        share: data.share,
        contextEnabled: data.contextEnabled
      }
    } else {
      title.value = '新建应用'
    }

  }

})


</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar :title="title" left-text="返回" left-arrow @click-left="back" />
    </template>

    <NSpace vertical class="create-store-main mt-4">


      <NForm ref="formRef" :model="formValue" :rules="rules">
        <NFormItem label="选择图标" path="iconUrl" required>
          <van-image round width="4rem" height="4rem" :src="formValue.iconUrl" class="m-auto"
            @click="() => { showBottom = true }" />
        </NFormItem>
        <NFormItem label="应用名称" path="appName" required>
          <NInput v-model:value="formValue.appName" placeholder="输入应用名称" />
        </NFormItem>
        <NFormItem label="应用描述" path="desc" required>
          <NInput v-model:value="formValue.desc" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5,
            }" placeholder="输入应用描述" />
        </NFormItem>
        <NFormItem label="指令" path="promot">
          <NInput v-model:value="formValue.promot" type="textarea" :autosize="{
              minRows: 3,
              maxRows: 5,
            }" placeholder="输入指令" />
        </NFormItem>
        <NFormItem label="应用类型" path="appType" required>
          <NSelect v-model:value="formValue.appType" placeholder="应用类型" :options="typeList" />
        </NFormItem>

        <NFormItem label="发布商店" path="share" required>
          <NSwitch v-model:value="formValue.share" :checked-value="1" :unchecked-value="0" />
        </NFormItem>
        <NFormItem label="开启上下文" path="contextEnabled" required>
          <NSwitch v-model:value="formValue.contextEnabled" :checked-value="1" :unchecked-value="0" />
        </NFormItem>
      </NForm>

      <div>
        <NButton block type="primary" @click="handleValidateButtonClick">
          保存
        </NButton>
      </div>
    </NSpace>

    <!-- 底部弹出 -->

    <van-action-sheet v-model:show="showBottom" title="选择图标">
      <div class="content">
        <div class="list">
          <div class="item" v-for="(item, i) of iconList" :key="i">
            <img :src="item.url" alt="" @click="handleImage(item)">
          </div>
        </div>
      </div>
    </van-action-sheet>

  </Page>
</template>

<style scoped lang="less">
.content {
  height: 40vh;
}

.list {
  display: flex;
  flex-wrap: wrap;

  .item {
    width: 25%;
    box-sizing: border-box;
    padding: 10px;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.create-store-main {
  padding: 0 15px;
  padding-top: 20px;
  padding-bottom: 60px;
}
</style>
