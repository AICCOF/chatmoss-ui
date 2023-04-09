<script setup lang="ts">
import { NButton, NCard, NDivider, NInput, NPopover, useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
// import dayjs from 'dayjs'
import BasicModal from './Modal/BasicModal.vue'
import { useUserStore } from '@/store'
import { SvgIcon } from '@/components/common'
import { getKeyList, getPlusInfo, getSystemNotice } from '@/api/personCenter'
defineProps(['register'])
const emits = defineEmits(['modifyPassword'])
const userStore = useUserStore()

const ms = useMessage()

// const plusEndTime = computed(() => {
//   return dayjs(userStore.userInfo.user.plusEndTime).format('YYYY-MM-DD HH:mm:ss')
// })
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
      title: '500万字符包',
      desc: '1元 = 5万字符',
      count: 30,
    },
    {
      title: '400万字符包',
      desc: '1元 = 3.7万字符',
      count: 30,
    },
    {
      title: '300万字符包',
      desc: '1元 = 3.3万字符',
      count: 30,
    },
    {
      title: '200万字符包',
      desc: '1元 = 3万字符',
      count: 30,
    },
    {
      title: '100万字符包',
      desc: '1元 = 2.8万字符',
      count: 7,
    },
    {
      title: '50万字符包',
      desc: '1元 = 2.5万字符',
      count: 50,
    },
    {
      title: '10万字符包',
      desc: '1元 = 2万字符',
      count: 10,
    },
    {
      title: '其他商品',
      desc: '',
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

defineExpose({ updated })

const apiKey = ref(localStorage.getItem('apiKey') || '') as any
function settingBtn() {
  if (apiKey.value === '' || apiKey.value.startsWith('sk-')) {
    localStorage.setItem('apiKey', apiKey.value)
    ms.info('key设置成功~请保证填写正确的key，并且key有额度没有过期~', { duration: 5000 })
    userStore.residueCountAPI()
  }
  else {
    ms.error('正确的key是以sk-开头的', { duration: 5000 })
  }
}

const chatMossPiecesNumber = ref(localStorage.getItem('chatMossPiecesNumber') || '') as any
function chatMossPiecesNumberEvent() {
  if (chatMossPiecesNumber.value !== '') {
    localStorage.setItem('chatMossPiecesNumber', chatMossPiecesNumber.value)
    ms.info('上下文对话条数设置成功~', { duration: 5000 })
  }
  else {
    ms.error('不能为空', { duration: 5000 })
  }
}

function getTextNum() {
  let chatMossTextNum = localStorage.getItem('chatMossTextNum')
  if (!chatMossTextNum)
    chatMossTextNum = '0'
  return chatMossTextNum
}
</script>

<template>
  <BasicModal transform-origin="center" @register="register">
    <NCard style="width:80%;max-width: 600px; min-width: 350px;" title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between">
        <div class="flex">
          <span class="mr-4">用户名称：{{ nickname }}</span>
          <!-- <span>{{ plusEndTime }}到期</span> -->
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
      <div class="title-h1">
        ApiKeys设置
      </div>
      <div class="flex">
        <NInput v-model:value="apiKey" class="mr-2" type="text" placeholder="请输入您的apiKey" />
        <NButton type="primary" ghost @click="settingBtn">
          确定
        </NButton>
      </div>
      <div class="tip-text-input">
        小提示：设置成功，并不代表您的key有余额或者正确
      </div>
      <div class="tip-text-input">
        可以使用这个网址进行检查：https://chatkey.imiku.net/?apikey=
      </div>
      <NDivider />
      <div>
        <span class="title-h2">本机累计使用字符数</span>：{{ getTextNum() }} 字符
      </div>
      <NDivider />
      <div>
        <div class="title-h1">
          上下文条数设置（建议30条）
        </div>
        <div class="flex">
          <NInput v-model:value="chatMossPiecesNumber" class="mr-2" type="text" placeholder="请设置上下文对话条数（官方建议是30次对话）" />
          <NButton type="primary" ghost @click="chatMossPiecesNumberEvent">
            确定
          </NButton>
        </div>
        <div class="tip-text-input">
          设置的太长会被截断，原因是ChatGPT3.5模型token字符数量有限，新问题一定要新建问题
        </div>
      </div>
    </NCard>
  </BasicModal>
</template>

<style lang="less">
.item {
  height: 7rem;
  flex: 1;
  min-width: 6rem;
}
.desc {
  font-size: 12px;
  margin-top: 8px;
}
.tip-text-input {
  font-size: 12px;
  margin-top: 20px;
  margin-bottom: -10px;
}
.title-h1 {
  margin: 10px 0px;
  color: #FF6666;
}
</style>
