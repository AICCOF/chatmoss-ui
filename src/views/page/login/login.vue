<script lang="ts" setup>
import {
  useMessage,
} from 'naive-ui'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import Page from '@/components/page/index.vue'
import { useAuthStoreWithout, useChatStore } from '@/store'
import { login } from '@/api'
import { sendToMsg } from '@/utils/vsCodeUtils'
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
function handleClick() {
  emit('loginSuccess')
}

const message = useMessage()

const loginForm = reactive({
  email: '',
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

async function loginEvent() {
  try {
    const res = await login<any>(loginForm) as any
    const authStore = useAuthStoreWithout()

    authStore.setToken(res.loginToken)
    chatStore.chatList()
    handleBack()
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
      <van-nav-bar title="登录" left-text="返回" left-arrow @click-left="handleBack" />
    </template>

    <div class="wrap-main">
      <div class="title">
        欢迎来到ChatMoss
      </div>
      <div class="content">
        <div class="input top">
          <input v-model="loginForm.email" type="text" placeholder="请输入登录邮箱">
        </div>
        <div class="input">
          <input v-model="loginForm.password" type="password" placeholder="请输入密码">
        </div>

        <div class="login cursor-pointer" @click="loginEvent">
          登录
        </div>
        <div class="register cursor-pointer" @click="() => { go({ name: 'register' }) }">
          注册
        </div>
        <div class="register cursor-pointer" @click="() => { go({ name: 'forget' }) }">
          忘记密码
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped  lang="less">
.login {
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

.register {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #5E82FF;
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
  height: 140px;
  padding-top: 100px;
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

  input {
    padding: 10px 0px;
    display: block;
    margin: 0 auto;
    width: 80%;
    border-bottom: 1px solid #E6E6E6;
  }
}

.top {
  margin-top: 50px;
}
</style>
