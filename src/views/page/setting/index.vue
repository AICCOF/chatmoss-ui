<script setup lang="ts">
import { NDivider, NSwitch, useDialog, useMessage } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
// import dayjs from 'dayjs'
import uni from '@dcloudio/uni-webview-js'
import { bindingStatus, unbind } from './../../../api/weixin'
import { useAppStore, useUserStore } from '@/store'
import { localStorage } from '@/utils/storage/localStorage'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
import { SvgIcon } from '@/components/common'
// let props = defineProps(['register'])
// const emits = defineEmits(['modifyPassword', 'register'])
const back = useBack()
const go = useGo()
const userStore = useUserStore()

const ms = useMessage()
const appStore = useAppStore()

const nickname = computed(() => {
  return userStore.userInfo.user.nickname
})

onMounted(() => {
  updated()
  bindingStatusAPI()
})
function updated() {
  userStore.residueCountAPI()
}
const bindInfo = ref({})

async function bindingStatusAPI() {
  const res = await bindingStatus()
  bindInfo.value = res.data || {}
}
const choose = reactive({
  chatmossTheme: localStorage.getItem('chatmossTheme') || 'dark',
  chatmossMode: localStorage.getItem('chatmossMode') || 'normal',
})
defineExpose({ updated })
userStore.getOpenaiList()
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

const fontSizeNum = ref(localStorage.getItem('fontSizeNum') || '85%') as any
function fontSizeNumBtn() {
  localStorage.setItem('fontSizeNum', fontSizeNum.value.endsWith('%') ? fontSizeNum.value : `${fontSizeNum.value < 50 ? 50 : fontSizeNum.value}%`)
  const htmlDom = document.querySelector('html') as any
  htmlDom.style.zoom = localStorage.getItem('fontSizeNum')
}

// 主题
function handleUpdateValue(chatmossTheme: string) {
  ms.info(chatmossTheme === 'dark' ? '深色模式开启' : '浅色模式开启')
  localStorage.setItem('chatmossTheme', chatmossTheme)
  appStore.setTheme(localStorage.getItem('chatmossTheme') as any)
  uni.postMessage({
    data: {
      theme: chatmossTheme,
    },
  })
}

// 模型选择
// console.log(userStore.getOpenaiVersion)
// if (userStore.userInfo.fourSwitch !== 'ON')
//   userStore.saveOpenaiVersion('3.5')

// 专业模式
function handleModeValue(chatmossMode: string) {
  // 专业模式 speciality | 正常模式 normal
  ms.info(chatmossMode === 'speciality' ? '专业模式开启' : '正常模式开启')
  localStorage.setItem('chatmossMode', chatmossMode)
}

const showPopover = ref(false)

function setOpenaiVersion(action) {
  userStore.saveOpenaiVersion(action)
  ms.success('模型切换成功')
}

const dialog = useDialog()
function bindEvent(type, text) {
  // 解绑操作
  if (text) {
    new Promise((resole, reject) => {
      dialog.error({
        title: '解绑',
        content: '确认解绑？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          const res = await unbind({
            type: type === 'email' ? 1 : 0,
          })
          ms.info(res.msg)
          bindingStatusAPI()
        },
        onNegativeClick: () => {

        },
      })
    })
  }
  else {
    if (type === 'email') {
      go({
        name: 'bindQQ',
        query: {
          type,
        },
      })
    }
    else {
      go({
        name: 'bindWechat',
        query: {
          type,
        },
      })
    }
  }
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="设置中心" left-text="返回" left-arrow @click-left="back" />
    </template>
    <div class="setting-mian">
      <div class="box flex items-center justify-between ">
        <div class="flex">
          <span class="mr-4">{{ nickname || '未登录' }}</span>
          <!-- <span>{{ plusEndTime }}到期</span> -->
        </div>
        <div class="flex">
          <div
            v-if="userStore.userInfo.user.email" id="question-push" class="mr-4 btn cursor-pointer"
            @click="() => { go({ name: 'feedback' }) }"
          >
            问题反馈
          </div>
          <div class="flex items-center btn cursor-pointer" @click="() => { go({ name: 'forget' }) }">
            修改密码
            <SvgIcon icon="icon-park-outline:right" />
          </div>
        </div>
      </div>
      <div class="box flex items-center justify-between mt-3">
        <div class="flex">
          <span class="mr-4">邮箱：{{ bindInfo.email }}</span>
        </div>
        <div class="flex">
          <!-- <div class="flex items-center btn cursor-pointer" @click="bindEvent('email', bindInfo.email)"
            v-if="bindInfo.accountType === 0">
            <span>{{ bindInfo.email ? '解绑' : '去绑定' }}</span>
            <SvgIcon icon="icon-park-outline:right" />
          </div> -->
        </div>
      </div>

      <div class="box flex items-center justify-between mt-3">
        <div class="flex">
          <span class="mr-4">微信账号:{{ bindInfo.wechat ? '已绑定' : '' }}</span>
        </div>
        <div class="flex">
          <!-- <div class="flex items-center btn cursor-pointer" @click="bindEvent('weChat', bindInfo.wechat)"
            v-if="bindInfo.accountType === 1">
            <span>{{ bindInfo.wechat ? '解绑' : '去绑定' }}</span>
            <SvgIcon icon="icon-park-outline:right" />
          </div> -->
        </div>
      </div>

      <div class="box mt-3">
        <div class="justify-between">
          <div>ApiKeys设置</div>
          <div class="tip-text-input">
            小提示：设置成功，并不代表您的key有余额或者正确
          </div>
          <div class="tip-text-input">
            可以点击这个网址进行检查：
            <a style="color: #0099FF;" href="https://open.aihao123.cn/" target="_blank">https://open.aihao123.cn/</a>
          </div>
        </div>
        <div class="flex mt-2 justify-between">
          <input v-model="apiKey" class="mr-2 input flex-1" type="text" placeholder="请输入您的apiKey">
          <van-button class="btn-primary" size="small" @click="settingBtn">
            确定
          </van-button>
        </div>
        <div class="flex mt-2 justify-between mt-4 ml-4">
          <van-radio-group v-model="userStore.useKey" direction="horizontal" @change="userStore.recordState">
            <van-radio name="1">
              使用key
            </van-radio>
            <van-radio name="0">
              不使用key
            </van-radio>
          </van-radio-group>
        </div>

        <van-divider />
        <div class="">
          <div class="flex justify-between">
            <div>OpenAI模型选择</div>
            <div>
              <van-popover
                v-model:show="showPopover" :actions="userStore.getModelList" placement="left"
                @select="setOpenaiVersion"
              >
                <template #reference>
                  <div class="footer-item footer-item-btn footer-item-btn1 model-version " style="margin-right: 0px;">
                    {{ userStore.getModeVersion.viewName }}
                    <SvgIcon icon="icon-park-outline:right" class="icon" />
                  </div>
                </template>
              </van-popover>
            </div>
          </div>
          <div class="tip-text-input">
            小提示：在ChatMoss中，ChatGPT4.0消耗的字符数要比ChatGPT3.5多
            <span class="font-bold" style="color: #FF6666;">{{ userStore.userInfo.fourRate }}</span>
            倍，但是回答的更加专业
          </div>
        </div>

        <van-divider />
        <div>
          <div class="flex justify-between items-center">
            <div> ChatMoss主题设定</div>
            <div class="flex">
              <NSwitch
                v-model:value="choose.chatmossTheme" checked-value="dark" unchecked-value="light"
                @update:value="handleUpdateValue"
              />
              <span class="ml-2">{{ choose.chatmossTheme === 'dark' ? '深色模式' : '浅色模式' }}</span>
            </div>
          </div>
        </div>
        <van-divider />
        <div>
          <div class="flex justify-between items-center">
            <div> 回答模式</div>
            <div class="flex">
              <NSwitch
                v-model:value="choose.chatmossMode" checked-value="speciality" unchecked-value="normal"
                @update:value="handleModeValue"
              />
              <span class="ml-2">{{ choose.chatmossMode === 'speciality' ? '专业模式' : '正常模式' }}</span>
            </div>
          </div>
        </div>

        <van-divider />

        <div class="justify-between">
          <div>字体大小设置</div>
        </div>
        <div class="flex mt-2 justify-between">
          <input v-model="fontSizeNum" class="mr-2 input flex-1" type="text" placeholder="请输入字体设置比例">
          <van-button class="btn-primary" size="small" @click="fontSizeNumBtn">
            确定
          </van-button>
        </div>
        <NDivider />
        <div class="justify-between">
          <div>
            <span>本机累计使用字符数:</span>
            <span class="title-h2">未知</span>
          </div>
          <div class="tip-text-input">
            小提示：数据统计之前采用本地统计并不准确，目前我们在做服务器数据统计，数据更准，敬请期待
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.tip-text-input {
  font-size: 12px;
  margin-top: 5px;
  // margin-bottom: -10px;
}

.title-h1 {
  margin: 10px 0px;
  color: #FF6666;
}

.box {
  background-color: var(--moss-header-color);
  border-radius: 5px;
  padding: 17px 15px;

  .btn {
    color: var(--moss-text-blue-color);
  }
}

.btn-primary {
  // background-color: var(--moss-text-reply-color);
  // color: var(--moss-header-color);
  border-radius: 26px;
  padding: 7px 14px;
}

.input {
  width: 87%;
  height: 30px;
  box-sizing: border-box;
  padding: 4px 20px;
  background-color: var(--moss-bg-content-color);
  border-radius: 27px;
}

.setting-mian {
  padding: 0 15px;
  padding-top: 20px;
  padding-bottom: 60px;
  min-height: 100%;
  background-color: var(--moss-bg-content-color);
  color: var(--moss-text);
}
</style>
