<script setup lang="ts">
import { NButton, NCard, NDataTable, NDivider, NForm, NFormItem, NInput, NPopover, useDialog, useMessage } from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { computed, h, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import BasicModal from './Modal/BasicModal.vue'
import { useUserStore } from '@/store'
import { SvgIcon } from '@/components/common'
import { deleteKey, getKeyList, getPlusInfo, getSystemNotice, getWithScore, saveKey } from '@/api/personCenter'
defineProps(['register'])
const emits = defineEmits(['modifyPassword'])
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
      desc: '10积分换取',
      count: 1,
    },
    {
      title: '3天plus会员',
      desc: '30积分换取',
      count: 3,
    },
    {
      title: '7天plus会员',
      desc: '70积分换取',
      count: 7,
    },
    {
      title: '30天plus会员',
      desc: '300积分换取',
      count: 30,
    },
  ],
})

onMounted(() => {
  updated()
})
function updated() {
  getPlusInfoAPI()
  getSystemNoticeAPI()
  getKeyListAPI()
}
async function getSystemNoticeAPI() {
  const res = await getSystemNotice()
  personCenter.value.notices = res.data || []
}
async function getPlusInfoAPI() {
  const res = await getPlusInfo()
  personCenter.value.score = res.data
}
async function getKeyListAPI() {
  const res = await getKeyList<any>()
  // console.log(res.data.rows)
  personCenter.value.dataList = res.data.rows
}

async function buyEvent(row: any) {
  dialog.warning({
    title: 'ChatMoss Plus兑换',
    content: `是否消耗${row.count * 10}积分，兑换${row.count}天ChatMoss Plus会员？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await getWithScore({ count: row.count })
        await getPlusInfoAPI()
        message.success('换取成功')
      }
      catch (error: any) {
        // console.log(error)
        message.error(error.msg)
      }
    },
    onNegativeClick: () => {
      // message.error('不确定')
    },
  })
}
interface Columns {
  key: number
  maxCount: string
  totalCount: number
  addScore: number
}
const createColumns = (): DataTableColumns<Columns> => {
  return [
    {
      title: 'key',
      key: 'key',
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      title: '字符上限',
      key: 'maxCount',
    },
    {
      title: '已分享字符',
      key: 'totalCount',
      render: (_: Columns) => {
        return `${_.totalCount || '0'}`
      },
    },
    {
      title: '已获得积分',
      key: 'addScore',
      render: (_: Columns) => {
        return `${_.addScore || '0'}`
      },
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
            onClick: () => deleteClick(row),
          },
          { default: () => '删除' },
        )
      },
    },
  ]
}

const columns = createColumns()

const formRef = ref<FormInst | null>(null)
const formValue = ref({
  key: '',
  maxCount: '',
  mining: 1,
})

async function handleValidateClick() {
  try {
    await saveKey(formValue.value)
    getKeyListAPI()
    formValue.value = { key: '', maxCount: '', mining: 1 }
    message.success('添加成功')
  }
  catch (error: any) {
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
        await deleteKey(row.id)
        getKeyListAPI()
        message.success('删除成功')
      }
      catch (error: any) {
        message.error(error.msg)
      }
    },
    onNegativeClick: () => {
      // message.error('不确定')
    },
  })
}

defineExpose({ updated })
</script>

<template>
  <BasicModal transform-origin="center" @register="register">
    <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between">
        <div class="flex">
          <span class="mr-4">{{ nickname }}: </span>
          <span>{{ plusEndTime }}到期</span>
        </div>
        <div class="flex">
          <NButton type="primary" size="tiny" quaternary @click="emits('modifyPassword')">
            修改密码
          </NButton>
          <NPopover style="max-height: 340px" trigger="click" scrollable>
            <template #trigger>
              <NButton quaternary circle size="tiny">
                <template #icon>
                  <span class="">
                    <SvgIcon icon="mdi:message-badge-outline" />
                  </span>
                </template>
              </NButton>
            </template>
            <div
              v-for="(item, index) of personCenter.notices"
              :key="index"
              class="notice flex items-center justify-center"
            >
              <div class="mr-4">
                <img :src="item.icon" style="width:30px" class="circle" alt="">
              </div>
              <div>
                <div> {{ item.content }}</div>
                <div>{{ item.createTime }}</div>
              </div>
            </div>
          </NPopover>
        </div>
      </div>

      <NDivider />

      <div class="">
        <div>我的积分:{{ personCenter.score }}</div>

        <div class="flex">
          <div
            v-for="(item, index) of personCenter.shops"
            :key="index"
            class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer" @click="buyEvent(item)"
          >
            <div>{{ item.title }}</div>
            <div>{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <NDivider />
      <div>
        <div class="notice pb-2">
          分享你的Key，获得积分，可设置被使用字符上限(每分享一万字符,获得1积分)
        </div>
        <div class="notice pb-2">
          4月7日0点正式使用大家分享的key，在此之前可以进行设置，但不会被调用
        </div>
        <NDataTable :columns="columns" :data="personCenter.dataList" :pagination="false" :bordered="false" border />
      </div>

      <div>
        <NForm ref="formRef" inline :label-width="80" :model="formValue" size="small">
          <NFormItem label="">
            <NInput v-model:value="formValue.key" placeholder="请输入key" />
          </NFormItem>
          <NFormItem label="">
            <NInput v-model:value="formValue.maxCount" placeholder="输入字符上上限" />
          </NFormItem>

          <NFormItem>
            <NButton attr-type="button" @click="handleValidateClick">
              新增
            </NButton>
          </NFormItem>
        </NForm>
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
