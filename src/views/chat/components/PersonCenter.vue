<script setup lang="ts">
import { NAlert, NAvatar, NButton, NCard, NDivider, NForm, NFormItem, NInput, NPopover, NSelect, NSpace, NSwitch, useMessage, useNotification } from 'naive-ui'
import { computed, h, onMounted, reactive, ref } from 'vue'
// import dayjs from 'dayjs'
import BasicModal from './Modal/BasicModal.vue'
import { useModel } from './Modal/hooks/useModal'
import { useAppStore, useUserStore } from '@/store'
import { SvgIcon } from '@/components/common'
import { getSystemNotice, sendFeedback } from '@/api/personCenter'
import type { Notice } from '@/store/modules/user/helper'
import { localStorage } from '@/utils/storage/localStorage'
// let props = defineProps(['register'])
const emits = defineEmits(['modifyPassword', 'register'])

const userStore = useUserStore()
const notification = useNotification()

const [registerModal, { openModel, closeModel }] = useModel()

const ms = useMessage()
const appStore = useAppStore()

// const nickname = computed(() => {
//   return userStore.userInfo.user.nickname
// })
const personCenter = ref<{
  notices:any[],
  [K: string]:any
}>({
  score: 0,
  notices: [],
  dataList: [],
  keyList: [],
  shops: [
    {
      title: '500万字符包',
      desc: '99元 1元 = 5万字符',
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
  // getKeyListAPI()
  userStore.residueCountAPI()
}
const temNotice = computed(() => userStore.getNotices || [])
async function getSystemNoticeAPI() {
  const res = await getSystemNotice<Notice[]>()
  personCenter.value.notices = res.data || []

  const notice = personCenter.value.notices[personCenter.value.notices.length - 1]

  if (res.data.length > temNotice.value.length) {
    notification.create({
      content: notice.content,
      meta: notice.createTime,
      avatar: () =>
        h(NAvatar, {
          size: 'small',
          round: true,
          src: notice.icon,
        }),
      duration: 5000,
      keepAliveOnHover: true,
    })
    userStore.setNotices(res.data)
  }
}
async function getPlusInfoAPI() {
  // const res = await getPlusInfo()
  // personCenter.value.score = res.data
}
// async function getKeyListAPI() {
//   const res = await getKeyList<any>()
//   // console.log(res.data.rows)
//   personCenter.value.dataList = res.data.rows
// }

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

const fontSizeNum = ref(localStorage.getItem('fontSizeNum') || '100%') as any
function fontSizeNumBtn() {
  localStorage.setItem('fontSizeNum', fontSizeNum.value)
  const htmlDom = document.querySelector('html') as any
  htmlDom.style.zoom = localStorage.getItem('fontSizeNum')
}

// const chatMossPiecesNumber = ref(localStorage.getItem('chatMossPiecesNumber') || '') as any
// function chatMossPiecesNumberEvent() {
//   if (chatMossPiecesNumber.value !== '') {
//     localStorage.setItem('chatMossPiecesNumber', chatMossPiecesNumber.value)
//     ms.info('上下文对话条数设置成功~', { duration: 5000 })
//   }
//   else {
//     ms.error('不能为空', { duration: 5000 })
//   }
// }

// function getTextNum() {
//   let chatMossTextNum = localStorage.getItem('chatMossTextNum')
//   if (!chatMossTextNum)
//     chatMossTextNum = '0'
//   return chatMossTextNum
// }

// 主题
function handleUpdateValue(chatmossTheme: string) {
  ms.info(chatmossTheme === 'dark' ? '深色模式开启' : '浅色模式开启')
  localStorage.setItem('chatmossTheme', chatmossTheme)
  appStore.setTheme(localStorage.getItem('chatmossTheme') as any)
}
function getNSwitchValue(): any {
  return localStorage.getItem('chatmossTheme')
}

const feedBackForm = reactive({
  title: '',
  content: '',
})

async function sendFeedbackEvent() {
  await sendFeedback(feedBackForm)
  ms.success('我们确定问题之后，会为您下发10万字符奖励，感谢您的反馈。')
  closeModel()
}

// 模型选择
// console.log(userStore.getOpenaiVersion)
if (userStore.userInfo.fourSwitch !== 'ON') {
  userStore.saveOpenaiVersion('3.5')
}
const modelValue = ref(userStore.getOpenaiVersion)

const options =ref<any[]>(userStore.options)

// 专业模式
function handleModeValue(chatmossMode: string) {
  // 专业模式 speciality | 正常模式 normal
  ms.info(chatmossMode === 'speciality' ? '专业模式开启' : '正常模式开启')
  localStorage.setItem('chatmossMode', chatmossMode)
}
function getNSwitchModeValue(): any {
  return localStorage.getItem('chatmossMode')
}
</script>

<template>
  <BasicModal key="2" style="min-width: 300px; width: 80%; height: 85vh; overflow: scroll;" transform-origin="center" @register="(...args: any[]) => emits('register', ...args)">
    <NCard title="" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="flex items-center justify-between">
        <div class="flex">
          <!-- <span class="mr-4">用户名称：{{ nickname || '未登录' }}</span> -->
          <!-- <span>{{ plusEndTime }}到期</span> -->
        </div>
        <div class="flex">
          <NButton v-if="userStore.userInfo.user.email" id="question-push" type="primary" size="tiny" quaternary @click="openModel()">
            问题反馈
          </NButton>
          <NButton type="primary" size="tiny" quaternary @click="emits('modifyPassword')">
            修改密码
          </NButton>
          <NPopover style="max-height: 340px" trigger="click" scrollable to="body">
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
              v-for="(item, index) of personCenter.notices" :key="index"
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
        可以点击这个网址进行检查：
        <a style="color: #0099FF;" href="https://open.aihao123.cn/" target="_blank">https://open.aihao123.cn/</a>
      </div>
      <NDivider />
      <div>
        <span class="title-h2">本机累计使用字符数</span>：未知
      </div>
      <div class="tip-text-input">
        小提示：数据统计之前采用本地统计并不准确，目前我们在做服务器数据统计，数据更准，敬请期待
      </div>
      <!-- <NDivider />
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
      </div> -->
      <NDivider />
      <div>
        <div class="title-h1">
          ChatMoss主题设定
        </div>
        <div class="flex">
          <NSwitch
            :default-value="getNSwitchValue()"
            checked-value="dark"
            unchecked-value="light"
            @update:value="handleUpdateValue"
          />
          {{ getNSwitchValue() === 'dark' ? '深色模式' : '浅色模式' }}
        </div>
      </div>
      <NDivider />
      <div>
        <div class="title-h1">
          回答模式（专业模式下会自动再每个问题后面拼接 请详细回答 五个字，理论上回答内容更多）
        </div>
        <div class="flex">
          <NSwitch
            :default-value="getNSwitchModeValue()"
            checked-value="speciality"
            unchecked-value="normal"
            @update:value="handleModeValue"
          />
          {{ getNSwitchModeValue() === 'speciality' ? '专业模式' : '正常模式' }}
        </div>
      </div>
      <NDivider />
      <div>
        <div class="title-h1">
          OpenAI模型选择
        </div>
        <div class="flex">
          <NSelect v-model:value="modelValue" :options="options" @change="(value)=>{ userStore.saveOpenaiVersion(value)}" />
        </div>
        <div class="tip-text-input">
          小提示：在ChatMoss中，ChatGPT4.0消耗的字符数要比ChatGPT3.5多
          <span class='font-bold' style="color: #FF6666;">{{ userStore.userInfo.fourRate }}</span>
          倍，但是回答的更加专业
        </div>
      </div>
      <NDivider />
      <div class="title-h1">
        字体大小设置
      </div>
      <div class="flex">
        <NInput v-model:value="fontSizeNum" class="mr-2" type="text" placeholder="请输入字体设置比例" />
        <NButton type="primary" ghost @click="fontSizeNumBtn">
          确定
        </NButton>
      </div>
    </NCard>
  </BasicModal>
  <BasicModal key="2" transform-origin="center" @register="registerModal">
    <NCard
      style="height: 60vh; overflow: scroll; width:80%;max-width: 600px; min-width: 350px;" title="问题反馈" :bordered="false" size="huge" role="dialog"
      aria-modal="true"
    >
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
