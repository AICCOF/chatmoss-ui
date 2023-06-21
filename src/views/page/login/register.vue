<script lang="ts" setup>
import {
  useMessage,
} from 'naive-ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Page from '@/components/page/index.vue'
import { useAuthStoreWithout, useChatStore } from '@/store'
import { emailCode, forgetPwdEmailCode, login, register } from '@/api'
import { sendToMsg } from '@/utils/vsCodeUtils'
import dragVerifyImgChip from '@/components/dragVerifyImgChip.vue'
import { staticData } from '@/store/static'
import { useBack, useGo } from '@/utils/router'
// const props = defineProps(['tab'])
const emit = defineEmits<Emit>()
const router = useRouter()
const back = useBack()
const go = useGo()
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

// console.log(router)

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
const disAble = ref(false)
if (router.currentRoute.value.query) {
  if (router.currentRoute.value.query.invite) {
    tabStr.value = 'register'
    disAble.value = true
    registerForm.invite = router.currentRoute.value.query.invite
  }
}
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
function handleBack() {
  if (router.currentRoute.value.query && router.currentRoute.value.query.invite) {
    // console.log(router.currentRoute.value.query.invite)
    go({
      name: 'Chat',
      query: {
        invite: router.currentRoute.value.query.invite,
      },
    })
  }
  else {
    back()
  }
}

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
        timer = null
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
async function registerEvent() {
  try {
    await register<Response>(registerForm)
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
    handleBack()
    handleClick()
    sendToMsg('chatMossToken', res.loginToken)
    go({ name: 'Chat' })
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="注册" left-text="返回" left-arrow @click-left="handleBack" />
    </template>

    <div class="wrap-main">
      <div class="title">
        欢迎来到ChatMoss
      </div>
      <div class="content">
        <div class="input top">
          <span class="span">邮箱</span>
          <input v-model="registerForm.email" type="text" placeholder="请输入邮箱">
        </div>
        <div class="input ">
          <span class="span">密码</span>
          <input v-model="registerForm.password" type="text" placeholder="密码由字母、数字或下划线组成">
        </div>

        <div class="input ">
          <span class="span">邮箱验证码</span>
          <input v-model="registerForm.emailCode" type="text" placeholder="请输入验证码" style="width:50%">
          <span class="send" @click="() => { verifyFlag.showLogin = true }"> {{ buttonInfo.text }}</span>
        </div>
        <div class="input">
          <span class="span">邀请码</span>
          <input v-model="registerForm.invite" type="text" placeholder="请输入邀请码（选填）" :disabled="disAble">
        </div>

        <div v-if="verifyFlag.showLogin" class="input">
          <span class="span">滑块验证</span>
          <div>
            <dragVerifyImgChip
              ref="verifyImg" v-model:isPassing="verifyFlag.loginFlag" :imgsrc="imgsrc" show-refresh
              :bar-width="40" text="请按住滑块拖动" success-text="验证通过"
              handler-icon="material-symbols:keyboard-double-arrow-right" success-icon="clarity:success-standard-solid"
              refresh-icon="ic:twotone-refresh" @refresh="refresh('loginFlag')"
              @passcallback="passcallback('loginFlag')"
            />
          </div>
        </div>

        <div class="register" @click="registerEvent">
          注册
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped  lang="less">
.register {
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
.send {
  color: #6388FF;
}

.wrap-main {
  background-image: url('https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/assets/bg.png');
  background-repeat: no-repeat;
  min-height: 100%;
  background-color: var(--moss-header-color);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.title {
  height: 100px;
  padding-top: 60px;
  padding-left: 45px;
  padding-right: 45px;
  box-sizing: border-box;
  font-size: 17px;
  font-weight: bold;
  color: #fff;
  line-height: 32px
}

.content {
  flex: 1;
  box-sizing: border-box;
  padding-left: 45px;
  padding-right: 45px;
  background-color: #fff;
  border-radius: 30px 30px 0px 0px;
  overflow: hidden;
}

.input {
  color: #9EA2B5;
  margin-top: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E6E6E6;

  .span {
    // flex:1;
    width: 100px;
    // text-align: right;
    font-weight: 500;
    color: #45485C;
  }

  input {
    text-align: right;
    padding: 10px 0px;
    display: block;
    margin: 0 auto;
    width: 100%;

  }
}

.top {
  margin-top: 50px;
}
</style>
