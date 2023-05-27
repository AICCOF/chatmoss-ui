<script lang="ts" setup>
import Page from "@/components/page/index.vue";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NTabPane,
  NTabs,
  useMessage,
} from 'naive-ui'
import { reactive, ref } from 'vue'
import { useAuthStoreWithout, useChatStore } from '@/store'
import { emailCode, forgetPwdEmailCode, login, register, resetPwd } from '@/api'
import { sendToMsg } from '@/utils/vsCodeUtils'
import dragVerifyImgChip from '@/components/dragVerifyImgChip.vue'
import { staticData } from '@/store/static'
import { useBack } from '@/utils/router'
const back = useBack()
const props = defineProps(['tab'])
const emit = defineEmits<Emit>()
const chatStore = useChatStore()
interface Emit {
  (e: 'loginSuccess'): void
}
const imgsrc = ref<string>(staticData.verifyImg)
function handleClick() {
  emit('loginSuccess')
}

interface Response {
  msg: string
  loginToken: string
}
const message = useMessage()

let timer: NodeJS.Timer | null = null
const buttonInfo = reactive({
  text: '发送验证码',
  time: 0,
})

const tabStr = ref(props.tab || 'login')

const verifyImg = ref<any>(null)
const verifyImg1 = ref<any>(null)
const registerForm = reactive({
  email: '',
  password: '',
  nickname: '',
  emailCode: '',
  phone: '',
  invite: '',
})
const verifyFlag = ref({
  showLogin: false,
  showForget: false,
  loginFlag: false,
  forgetFlag: false,
})
function refresh(val: 'loginFlag' | 'forgetFlag') {
  if (val == 'loginFlag')
    verifyImg.value.reset()

  else
    verifyImg1.value.reset()
}
function passcallback(val: 'loginFlag' | 'forgetFlag') {
  val === 'loginFlag' && sendCode()
  val === 'forgetFlag' && sendForgetCode()
  setTimeout(() => {
    refresh(val)
  }, 3000)
}
const loginForm = reactive({
  email: '',
  password: '',
})
const forgetForm = reactive({
  email: '',
  emailCode: '',
  password: '',
})

async function sendCode() {
  try {
    const res = await emailCode<{ msg: string }>({
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname,
    })

    buttonInfo.time = 60
    timer = setInterval(() => {
      if (buttonInfo.time == 0 && timer) {
        clearInterval(timer)
        buttonInfo.text = '发送验证码'
        timer = null;
        return
      }
      buttonInfo.time--
      buttonInfo.text = `${buttonInfo.time}s后，重新发送`
    }, 1000)

    message.info(res.data?.msg || '发送成功', { duration: 5000 })
  }
  catch (error: any) {
    const list: any = error.data || {}
    // 增加错误提示
    for (const key in list) {
      message.warning(list[key], { duration: 5000 })
      return
    }
    message.warning(error.msg, { duration: 5000 })
  }
}

// 重置密码-邮箱验证码
async function sendForgetCode() {
  try {
    const res = await forgetPwdEmailCode<{ msg: string }>({
      email: forgetForm.email,
    })

    buttonInfo.time = 60

    timer = setInterval(() => {
      if (buttonInfo.time == 0 && timer) {
        clearInterval(timer)
        buttonInfo.text = '发送验证码'
        return
      }
      buttonInfo.time--
      buttonInfo.text = `${buttonInfo.time}s后，重新发送`
    }, 1000)

    message.info(res.data?.msg || '发送成功', { duration: 5000 })
  }
  catch (error: any) {
    const list: any = error.data || {}
    // 增加错误提示
    for (const key in list) {
      message.warning(list[key], { duration: 5000 })
      return
    }
    message.warning(error.msg, { duration: 5000 })
  }
}

// 重置密码
async function forgetEvent() {
  try {
    await resetPwd<any>(forgetForm) as any
    message.info('重置成功，快去登录吧', { duration: 5000 })
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}

async function registerEvent() {
  try {
    await register<Response>(registerForm)
    tabStr.value = 'login'
    message.success('注册成功')
    // 注册完成之后，调用登录
    loginForm.email = registerForm.email
    loginForm.password = registerForm.password
    loginEvent()
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}

async function loginEvent() {
  try {
    const res = await login<any>(loginForm) as any
    const authStore = useAuthStoreWithout()

    authStore.setToken(res.loginToken)
    chatStore.chatList()
    back();
    handleClick()
    sendToMsg('chatMossToken', res.loginToken)
    
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="登录&注册&重置密码" left-text="返回" left-arrow @click-left="back">
      </van-nav-bar>
    </template>


    <NTabs v-model:value="tabStr" justify-content="space-evenly" type="line">
      <NTabPane name="login" tab="登录">
        <NForm ref="formRef" :model="loginForm" :style="{ maxWidth: '640px' }" class="auto" style="margin:0 auto;">
          <NFormItem label="邮箱" path="email" :rule="{
              required: true,
              message: '请输入邮箱',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="loginForm.email" autocomplete="on" placeholder="请输入邮箱" clearable />
          </NFormItem>
          <NFormItem label="密码" path="password" autocomplete="on" :rule="{
              required: true,
              message: '密码由字母、数字或下划线组成！',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="loginForm.password" placeholder="密码由字母、数字或下划线组成！" type="password"
              show-password-on="mousedown" />
          </NFormItem>

          <NFormItem>
            <NSpace>
              <NButton attr-type="button" block @click="loginEvent">
                登录
              </NButton>
            </NSpace>
          </NFormItem>
        </NForm>
      </NTabPane>
      <NTabPane name="register" tab="注册">
        <NForm ref="formRef" :model="registerForm" :style="{ maxWidth: '640px' }" class="auto" style="margin:0 auto;">
          <NFormItem label="邮箱" path="email" :rule="{
              required: true,
              message: '请输入邮箱',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.email" placeholder="请输入邮箱" clearable />
          </NFormItem>
          <NFormItem label="密码" path="password" :rule="{
              required: true,
              message: '密码由字母、数字或下划线组成！',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.password" placeholder="密码由字母、数字或下划线组成！" type="password"
              show-password-on="mousedown" />
          </NFormItem>
          <NFormItem label="昵称" path="nickname" :rule="{
              required: true,
              message: '请输入昵称',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.nickname" placeholder="请输入昵称" clearable />
          </NFormItem>
          <NFormItem label="手机号" path="phone" :rule="{
              required: true,
              message: '请输入手机号',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.phone" placeholder="请输入手机号" clearable />
          </NFormItem>

          <NFormItem label="邮箱验证码" path="emailCode" :rule="{
              required: true,
              message: '请输入邮箱验证码',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.emailCode" placeholder="请输入验证码" clearable />
            <NButton style="margin-left: 12px" @click="() => { verifyFlag.showLogin = true }">
              {{ buttonInfo.text }}
            </NButton>
          </NFormItem>

          <NFormItem v-if="verifyFlag.showLogin" label="滑块验证" :rule="{
              required: true,
            }">
            <dragVerifyImgChip ref="verifyImg" v-model:isPassing="verifyFlag.loginFlag" :imgsrc="imgsrc" show-refresh
              :bar-width="40" text="请按住滑块拖动" success-text="验证通过"
              handler-icon="material-symbols:keyboard-double-arrow-right" success-icon="clarity:success-standard-solid"
              refresh-icon="ic:twotone-refresh" @refresh="refresh('loginFlag')"
              @passcallback="passcallback('loginFlag')" />
          </NFormItem>
          <NFormItem label="邀请人邮箱（双方都可获得10w字符额度）" path="email" :rule="{
              required: false,
              message: '',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="registerForm.invite" placeholder="请输入邀请人邮箱" clearable />
          </NFormItem>

          <NFormItem>
            <NSpace>
              <NButton attr-type="button" block @click="registerEvent">
                注册
              </NButton>
            </NSpace>
          </NFormItem>
        </NForm>
      </NTabPane>
      <NTabPane name="forget" tab="重置密码">
        <NForm ref="formRef" :model="forgetForm" :style="{ maxWidth: '640px' }" class="auto" style="margin:0 auto;">
          <NFormItem label="注册邮箱" path="email" :rule="{
              required: true,
              message: '请输入注册邮箱',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="forgetForm.email" placeholder="请输入注册邮箱" clearable />
          </NFormItem>
          <NFormItem label="邮箱验证码" path="emailCode" :rule="{
              required: true,
              message: '请输入重置邮箱验证码',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="forgetForm.emailCode" placeholder="请输入验证码" clearable />
            <NButton style="margin-left: 12px" @click="() => verifyFlag.showForget = true">
              {{ buttonInfo.text }}
            </NButton>
          </NFormItem>

          <NFormItem v-if="verifyFlag.showForget" label="滑块验证" :rule="{
              required: true,
            }">
            <dragVerifyImgChip ref="verifyImg1" v-model:isPassing="verifyFlag.forgetFlag" :imgsrc="imgsrc" show-refresh
              :bar-width="40" text="请按住滑块拖动" success-text="验证通过"
              handler-icon="material-symbols:keyboard-double-arrow-right" success-icon="clarity:success-standard-solid"
              refresh-icon="ic:twotone-refresh" @refresh="refresh('forgetFlag')"
              @passcallback="passcallback('forgetFlag')" />
          </NFormItem>
          <NFormItem label="新的密码" path="password" :rule="{
              required: true,
              message: '请输入新的密码',
              trigger: ['input', 'blur'],
            }">
            <NInput v-model:value="forgetForm.password" placeholder="密码由字母、数字或下划线组成！" type="password"
              show-password-on="mousedown" />
          </NFormItem>

          <NFormItem>
            <NSpace>
              <NButton attr-type="button" :block="true" @click="forgetEvent">
                确定重置
              </NButton>
            </NSpace>
          </NFormItem>
        </NForm>
      </NTabPane>
    </NTabs>



  </Page>
</template>
