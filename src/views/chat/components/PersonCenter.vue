<script setup lang="ts">
import BasicModal from './Modal/BasicModal.vue'
import { NButton, NPopover, NCard, NDivider, NDataTable, FormInst, NForm, NFormItem, NInput, useMessage, useDialog } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import type { DataTableColumns } from 'naive-ui'
import { computed, h, onMounted, ref } from 'vue'
import { useUserStore } from '@/store'
import dayjs from 'dayjs';
import { deleteKey, getKeyList, getPlusInfo, getSystemNotice, getWithScore, saveKey } from '@/api/personCenter'
defineProps(['register'])
let emits = defineEmits(['modifyPassword'])
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

const plusEndTime = computed(() => {
  return dayjs(userStore.userInfo.user.plusEndTime).format('YYYY-MM-DD HH:mm:ss')
})
const nickname = computed(() => {
  return userStore.userInfo.user.nickname
})
// const notices = ref<any>([])
const personCenter = ref<any>({
  score: 0,
  notices: [],
  dataList: [],
  keyList: [],
  shops: [
    {
      title: '1天plus会员',
      desc: '1000积分换取',
      count: 1
    },
    {
      title: '3天plus会员',
      desc: '1000积分换取',
      count: 3
    },
    {
      title: '7天plus会员',
      desc: '7000积分换取',
      count: 7
    },
    {
      title: '30天plus会员',
      desc: '3w积分换取',
      count: 30
    }
  ]
})

onMounted(() => {
 updated()
})
function updated() {
  getPlusInfoAPI()
  getSystemNoticeAPI()
  getKeyListAPI();
}
async function getSystemNoticeAPI() {
  let res = await getSystemNotice()
  personCenter.value.notices = res.data || [];
}
async function getPlusInfoAPI() {
  let res = await getPlusInfo()
  personCenter.value.score = res.data;
}
async function getKeyListAPI() {
  let res = await getKeyList<any>()
  // console.log(res.data.rows)
  personCenter.value.dataList = res.data.rows;
}

async function buyEvent(row: any) {
  dialog.warning({
    title: '确定换取',
    content: '确定此操作？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await getWithScore({ count: row.count })
        await getPlusInfoAPI()
        message.success('换取成功')
      } catch (error) {
        // console.log(error)
        message.error(error.msg)
      }
    },
    onNegativeClick: () => {
      // message.error('不确定')
    }
  })

}
type Columns = {
  key: number
  maxCount: string
  totalCount:number;
  addScore:number;
}
const createColumns = (): DataTableColumns<Columns> => {
  return [
    {
      title: 'key',
      key: 'key',
      width: 100,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '字符上限',
      key: 'maxCount'
    },
    {
      title: '已分享字符',
      key: 'totalCount',
      render: (_:Columns) => {
        return `${_.totalCount || '0'}`
      }
    },
    {
      title: '已获得积分',
      key: 'addScore',
      render: (_: Columns) => {
        return `${_.addScore || '0'}`
      }
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => deleteClick(row)
          },
          { default: () => '删除' }
        )
      }
    }
  ]
}

const columns = createColumns()


const formRef = ref<FormInst | null>(null)
let formValue = ref({
  key: '',
  maxCount: '',
  mining: 1
})

async function handleValidateClick() {
  try {
    await saveKey(formValue.value);
    getKeyListAPI();
    formValue.value = { key :'', maxCount :'', mining :1};
    message.success('添加成功')   
  } catch (error: any) {
    message.error(error.msg)
  }
}


async function deleteClick(row: any) {

  dialog.warning({
    title: '确定删除',
    content: '确定此操作？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteKey(row.id);
         getKeyListAPI();
        message.success('删除成功')
      } catch (error: any) {
        message.error(error.msg)
      }
    },
    onNegativeClick: () => {
      // message.error('不确定')
    }
  })

}


defineExpose({ updated })

</script>

<template>
  <BasicModal @register='register' transform-origin="center">
    <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between">
        <div class="flex">
          <span class="mr-4">{{ nickname }}: </span>
          <span>{{ plusEndTime }}到期</span>
        </div>
        <div class="flex">
          <n-button type="primary" size="tiny" quaternary @click="emits('modifyPassword')">
            修改密码
          </n-button>
          <n-popover style="max-height: 340px" trigger="click" scrollable>
            <template #trigger>
              <n-button quaternary circle size="tiny">
                <template #icon>
                  <span class="">
                    <SvgIcon icon="mdi:message-badge-outline" />
                  </span>
                </template>
              </n-button>
            </template>
            <div class="notice flex items-center justify-center" v-for="item of personCenter.notices">
              <div class="mr-4">
                <img :src="item.icon" style="width:30px" class="circle" alt="">
              </div>
              <div>
                <div> {{ item.content }}</div>
                <div>{{ item.createTime }}</div>
              </div>
            </div>
          </n-popover>

        </div>
      </div>

      <n-divider />

      <div class="">
        <div>我的积分:{{ personCenter.score }}</div>

        <div class="flex">
          <div
            class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer"
            v-for='item of personCenter.shops' @click="buyEvent(item)">
            <div>{{ item.title }}</div>
            <div>{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <n-divider />
      <div>
        <div class="notice pb-2">分享你的key,获得积分(每分享一万字符,获得1积分)</div>

        <n-data-table :columns="columns" :data="personCenter.dataList" :pagination="false" :bordered="false" border />
      </div>


      <div>

        <n-form ref="formRef" inline :label-width="80" :model="formValue" size="small">
          <n-form-item label="">
            <n-input v-model:value="formValue.key" placeholder="请输入key" />
          </n-form-item>
          <n-form-item label="">
            <n-input v-model:value="formValue.maxCount" placeholder="输入字符上上限" />
          </n-form-item>

          <n-form-item>
            <n-button attr-type="button" @click="handleValidateClick">
              新增
            </n-button>
          </n-form-item>
        </n-form>

      </div>







    </NCard>

  </BasicModal>
</template>

<style lang="less">
.item {
  width: 8rem;
  height: 8rem;

}
</style>