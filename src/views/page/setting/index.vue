<script setup lang="ts">
import { NDivider, NSwitch } from 'naive-ui'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
// import dayjs from 'dayjs'
import { Modal, message as ms } from 'ant-design-vue'
import uni from '@dcloudio/uni-webview-js'
import { useRouter } from 'vue-router'
import { bindingStatus } from './../../../api/weixin'
import { useAppStore, useUserStore } from '@/store'
import { localStorage } from '@/utils/storage/localStorage'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
import { SvgIcon } from '@/components/common'
import { accountClose } from '@/api/account'
import { NPopover, useMessage } from 'naive-ui'
// let props = defineProps(['register'])
// const emits = defineEmits(['modifyPassword', 'register'])
const back = useBack()
const go = useGo()
const userStore = useUserStore()
const router = useRouter()
const appStore = useAppStore()

const nickname = computed(() => {
  return userStore.userInfo.user ? userStore.userInfo.user.nickname : false
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
    ms.info('key设置成功~请保证填写正确的key，并且key有额度没有过期~', 5)
    userStore.residueCountAPI()
  }
  else {
    ms.error('正确的key是以sk-开头的', 5)
  }
}

const fontSizeNum = ref(localStorage.getItem('fontSizeNum') || '90%') as any
function fontSizeNumBtn() {
  // 获取用户输入的字体大小值
  const userInput = fontSizeNum.value.trim()
  // 提取输入中的数值部分
  let fontSizeValue = parseFloat(userInput)
  if (isNaN(fontSizeValue)) {
    // 如果输入不是有效的数值，则默认使用最小值
    fontSizeValue = 65
  }

  // 确保字体大小在范围内
  fontSizeValue = Math.max(65, Math.min(150, fontSizeValue))

  // 格式化为百分比形式
  const formattedValue = `${fontSizeValue}%`

  // 将值存储到 localStorage
  localStorage.setItem('fontSizeNum', formattedValue)
  const htmlDom = document.querySelector('html') as any
  htmlDom.style.zoom = localStorage.getItem('fontSizeNum')
}
let config = ref({
  fontSizeFlag: false,
  apiKeysFlag: false
})

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
const open = ref(false)
const secondsToGo = ref(10)
let interval: any
function handleClose() {
  clearInterval(interval)
}
function handleLogout() {
  open.value = true
  secondsToGo.value = 10
  interval = setInterval(() => {
    secondsToGo.value -= 1
    if (secondsToGo.value <= 0) {
      secondsToGo.value = 0
      clearInterval(interval)
    }
  }, 1000)
}
async function handleConfirm() {
  if (secondsToGo.value === 0) {
    await accountClose()
    ms.info('注销成功')
    localStorage.clear()
    await nextTick()
    back()
  }
}

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

function handleUseKey() {
  if(userStore.useKey==='1'){
    ms.success('启用Key成功')
  }else{
    ms.success('取消Key使用成功')
  }
 userStore.recordState()
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="设置中心" left-arrow @click-left="back" class="my-nav-bar" />
    </template>
    <div class="px-[14px]">
      <div class="setting-box !py-[10px]">
        <div class="item">
          <div class="flex item-title text-[16px]">
            <span class="mr-4">ID: {{ nickname || '未登录' }}</span>
            <!-- <span>{{ plusEndTime }}到期</span> -->
          </div>
          <div class="flex item-info  text-[11px]">
            <div v-if="userStore.userInfo.user && userStore.userInfo.user.email" id="question-push" class="mr-4 btn "
              @click="() => { go({ name: 'feedback' }) }">
              问题反馈
            </div>
            <div class="flex items-center btn" @click="() => { go({ name: 'forget' }) }">
              修改密码
              <SvgIcon class="text-[16px]" icon="icon-park-outline:right" />
            </div>
          </div>
        </div>
        <div class="item">
          <div class="flex item-title text-[16px]">
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
        <div class="item no-border">
          <div class="flex item-title text-[16px]">
            <span class="mr-4">微信账号: {{ bindInfo.wechat ? '已绑定' : '' }}</span>
          </div>
          <div class="flex">
            <!-- <div class="flex items-center btn cursor-pointer" @click="bindEvent('weChat', bindInfo.wechat)"
            v-if="bindInfo.accountType === 1">
            <span>{{ bindInfo.wechat ? '解绑' : '去绑定' }}</span>
            <SvgIcon icon="icon-park-outline:right" />
          </div> -->
          </div>
        </div>
      </div>

      <div class="setting-box !py-[20px]">
        <div class="flex justify-between items-center text-[#1A1A1A] dark:text-[#ffffff] text-[16px]">
          <div>ApiKeys设置</div>
          <div>
            <NSwitch v-model:value="userStore.useKey" class="setting-switch" @update:value="handleUseKey"
              checked-value="1" unchecked-value="0" />
          </div>
        </div>
        <div class="flex justify-between items-center mt-[15px]">
          <input v-model="apiKey"
            class="mr-2 w-[100%] h-[39px] flex-1 border-[#CECED2] box-border py-[3px] px-[15px] text-[#8B8D97] bg-[#FFFFFF] text-[13px] dark:border-[#3A3A3C] dark:text-[#69696A] dark:bg-[#282828]"
            type="text" placeholder="请输入您的apiKey" style="border-radius: 9px;border-width: 1px ;border-style: solid;"
            @input="() => config.apiKeysFlag = true">

          <div class="flex items-center justify-center"
            :class="[config.apiKeysFlag ? 'border-[#7569ff] text-[#7569ff] dark:border-[#7569ff] dark:text-[#ffffff]' : 'border-[#CECED2] text-[#8B8D97] dark:border-[#3A3A3C] dark:text-[#69696A]']"
            style="width: 75px;height: 39px;border-radius: 9px;border-width: 1px ;border-style: solid;"
            @click="settingBtn">
            确定
          </div>
        </div>
      </div>
      <div class="setting-box !py-[20px]">
        <div class="flex justify-between items-center text-[16px] text-[#1A1A1A] dark:text-[#ffffff]">
          <div>OpenAI模型选择</div>
          <div>
            <!-- <van-popover v-model:show="showPopover" :actions="userStore.getModelList" placement="left"
              @select="setOpenaiVersion">
              <template #reference>
                <div class="flex items-center text-[#8B8D97]" style="font-size: 11px;">
                  {{ userStore.getModeVersion.viewName }}
                  <SvgIcon icon="icon-park-outline:right" class="icon" />
                </div>
              </template>
            </van-popover> -->
            <NPopover class="myPopover" ref="popoverDom" trigger="hover" placement="top">
              <template #trigger>
                <div class="flex items-center text-[#8B8D97]" style="font-size: 11px;">
                  {{ userStore.getModeVersion.viewName }}
                  <SvgIcon icon="icon-park-outline:right" class="icon" />
                </div>
              </template>
              <div>
                <div v-for="(item, i) of userStore.getModelList" :key="i"
                  class="model-item hover:text-[#BFBFBF] dark:hover:text-[#A7A9B2] text-[#1A1A1A] dark:text-[#FFFFFF]"
                  :class="[i < (userStore.getModelList.length - 1) ? 'line border-[#F6F7FA] dark:border-[#2D2D2E]' : '']"
                  @click="setOpenaiVersion(item)">
                  <div class="cursor flex items-center h-[35px]">
                    <img :src="item.icon" class="w-[22px] h-[22px] mr-[8px]" alt="">
                    <span>{{ item.viewName }}</span>
                  </div>
                </div>
              </div>
            </NPopover>

          </div>
        </div>
        <div class="text-[#8b8d97] opacity-80 text-[11px] mt-[15px] dark:text-[#69696A]">
          小提示：在ChatMoss中，ChatGPT4.0消耗的字符数要比ChatGPT3.5多
          <span class="font-bold" style="color: #FF6666;">{{ userStore.userInfo.fourRate }}</span>
          倍，但是回答的更加专业
        </div>
      </div>

      <div class="setting-box !pt-[10px] !pb-[20px]">
        <div class="item">
          <div class="flex item-title text-[16px]">
            <div> ChatMoss主题设定</div>
          </div>
          <div class="flex item-info">
            <span class="mr-2">{{ choose.chatmossTheme === 'dark' ? '深色模式' : '浅色模式' }}</span>
            <NSwitch class="setting-switch" v-model:value="choose.chatmossTheme" checked-value="dark"
              unchecked-value="light" @update:value="handleUpdateValue" />

          </div>
        </div>
        <div class="item">
          <div class="flex item-title text-[16px]">
            <div>回答模式</div>
          </div>
          <div class="flex item-info items-center">
            <span class="mr-2">{{ choose.chatmossMode === 'speciality' ? '专业模式' : '正常模式' }}</span>
            <NSwitch class="setting-switch" v-model:value="choose.chatmossMode" checked-value="speciality"
              unchecked-value="normal" @update:value="handleModeValue" />

          </div>
        </div>

        <div class="mt-[17px]">
          <div class="flex justify-between items-center text-[16px] text-[#1A1A1A] dark:text-[#ffffff]">
            <div>字体大小设置</div>
          </div>
          <div class="flex justify-between items-center mt-[15px]">
            <input v-model="fontSizeNum"
              class="mr-2 w-[100%] h-[39px] flex-1 border-[#CECED2] box-border py-[3px] px-[15px] text-[#8B8D97] text-[13px] bg-[#ffffff] dark:border-[#3A3A3C] dark:text-[#69696A] dark:bg-[#282828]"
              type="text" placeholder="请输入字体设置比例" style="border-radius: 9px;border-width: 1px ;border-style: solid;"
              @input="() => config.fontSizeFlag = true">

            <div class="flex items-center justify-center"
              :class="[config.fontSizeFlag ? 'border-[#7569ff] text-[#7569ff] dark:border-[#7569ff] dark:text-[#ffffff]' : 'border-[#CECED2] text-[#8B8D97] dark:border-[#3A3A3C] dark:text-[#69696A]']"
              style="width: 75px;height: 39px;border-radius: 9px;border-width: 1px ;border-style: solid;"
              @click="fontSizeNumBtn">
              确定
            </div>
          </div>

        </div>

      </div>

      <div class="setting-box !py-[20px]" @click="handleLogout">
        <div class="flex justify-between items-center text-[#1A1A1A] text-[16px] dark:text-[#ffffff]">
          <div>注销</div>
          <div class="text-[#A8AAB6] ">
            <SvgIcon class="text-[16px]" icon="icon-park-outline:right" />
          </div>
        </div>
        <div class="text-[#8B8D97] dark:text-[#69696A] text-[11px] mt-[15px]">
          注销账号之后，账号数据将会全部被清空，不可恢复，账号也不可重新注册
        </div>
      </div>


    </div>

    <Modal v-model:visible="open" :title="null" :footer="null" centered class="self-model" style="width: fit-content"
      @cancel="handleClose">
      <div style="width: 410px; height: 310px; overflow: hidden; border-radius: 16px; background: #fff">
        <div style="
            width: 410px;
            height: 70px;
            background: linear-gradient(90deg, #756df2 0%, #756df2 100%);
            color: #fff;
            font-size: 24px;
            font-weight: 600;
            line-height: 70px;
            text-align: center;
          ">
          注销账号
        </div>
        <div class="opacity-80" style="
            box-sizing: border-box;
            margin-top: 50px;
            padding: 0 27px;
            color: #1c212a;
            font-size: 16px;
            font-weight: 500;
            line-height: 22px;
          ">
          是否注销账号，注销账号之后，账号数据将会被全部清空，不可恢复，账号也不可重新注册
        </div>

        <div class="flex-center justify-between" style="box-sizing: border-box; margin-top: 50px; padding: 0 27px">
          <div class="btn-confirm" :class="[secondsToGo === 0 ? 'active' : '']" @click="handleConfirm">
            确认<span v-if="secondsToGo > 0">（{{ secondsToGo }}）</span>
          </div>
          <div style="
              width: 170px;
              height: 54px;
              border-radius: 8px;
              background: #605dff;
              color: #fff;
              font-size: 18px;
              font-weight: 500;
              line-height: 54px;
              text-align: center;
            " @click="() => (open = false)">
            取消
          </div>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<style lang="less" scoped>
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 55px;
  line-height: 55px;
  border-bottom: 1px solid #F6F7FB;

  &.no-border {
    border-width: 0 !important;
  }

  .item-title {
    color: #1A1A1A;
  }

  .item-info {
    display: flex;
    font-size: 12px;
    align-items: center;
    color: #A8AAB6;
  }
}

.btn-confirm {
  width: 170px;
  height: 54px;
  border: 1px solid #cdcdcd;
  border-radius: 8px;
  background: #fff;
  color: #cdcdcd;
  font-size: 18px;
  font-weight: 500;
  line-height: 54px;
  text-align: center;

  &.active {
    color: #1d2129;
  }
}

.tip-text-input {
  font-size: 12px;
  margin-top: 5px;
  // margin-bottom: -10px;
}

.title-h1 {
  margin: 10px 0px;
  color: #FF6666;
}


.setting-box {
  // width: 347px;
  margin: 0 auto;
  margin-top: 11px;
  box-sizing: border-box;
  padding: 0 15px;
  background-color: #FFFFFF;
  border-radius: 11px;

  .btn {
    // color: var(--moss-text-blue-color);
  }
}

.dark {
  .setting-box {
    background-color: #282828;
    ;
  }

  .item {
    border-bottom: 1px solid #151515;

    .item-title {
      color: #FFFFFF;
    }

    .item-info {
      color: #A8AAB6;
    }
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
  border-radius: 27px;
}

.setting-mian {
  padding: 0 15px;
  padding-top: 20px;
  padding-bottom: 60px;
  min-height: 100%;
}
</style>
