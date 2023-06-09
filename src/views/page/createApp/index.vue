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
  if (formValue.value.id) {
    getApplicationUpdateAPI()
  } else {
    getApplicationCreateAPI();
  }

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

    <div vertical class="main-bg">
      <div class="box">
        <div class="flex justify-between items-center">
          <div>请挑选一个应用的图标</div>
          <div>
            <van-image round width="3rem" height="3rem" :src="formValue.iconUrl" class="m-auto"
              @click="() => { showBottom = true }" />
          </div>
        </div>
        <van-divider />
        <div class=" flex justify-between items-center">
          <div>应用名称</div>
          <div class="flex-1">
            <input class="input" v-model="formValue.appName" placeholder="例如：智能翻译助手(限12字)" />
          </div>
        </div>
        <van-divider />
        <div class="">
          <div>应用描述</div>
          <div class="flex-1">
            <textarea class="textarea" type="textarea" v-model="formValue.desc" placeholder="例如：智能翻译助手(限12字)" />
          </div>
        </div>
        <van-divider />
         <div class="">
            <div>指令</div>
            <div class="flex-1">
              <textarea class="textarea" type="textarea" v-model="formValue.promot" placeholder="例如：智能翻译助手智能翻译助手" />
            </div>
          </div>
          <van-divider />
        <div class="flex justify-between items-center">
          <div>应用类型</div>
          <div class="">
            <NSelect v-model:value="formValue.appType" placeholder="应用类型" :options="typeList" style="width: 100px;" />
          </div>
        </div>
      </div>
      <div class="box mt-4">
        <div class=" flex justify-between items-center">
          <div>发布商店</div>
          <div class="">
            <NSwitch v-model:value="formValue.share" :checked-value="1" :unchecked-value="0" />
          </div>
        </div>
        <van-divider />
        <div class="flex justify-between items-center">
          <div>开启上下文</div>
          <div class="">
            <NSwitch v-model:value="formValue.contextEnabled" :checked-value="1" :unchecked-value="0" />
          </div>
        </div>

      </div>
      <div class="save" @click="handleValidateButtonClick">保存</div>

    </div>

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

.save {
  text-align: center;
  width: 80%;
  height: 37px;
  margin: 0 auto;
  margin-top: 25px;
  background-color: #45485C;
  border-radius: 37px;
  line-height: 37px;
  color: #FFFFFF;
}

.textarea {
  width: 100%;
  margin-top: 10px;
  padding: 5px 10px;
  height: 100px;
  background-color: #F7F8FC;
  border-radius: 8px;
}

.input {
  padding: 0 10px;
  text-align: right;
  width: 100%;
}

.content {
  height: 40vh;
}

.list {
  display: flex;
  flex-wrap: wrap;

  .item {
    width: 20%;
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
