<script lang="ts" setup>
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
import { useAuthStoreWithout } from '@/store'
import { emailCode, login, register } from '@/api'
interface Emit {
  (e: 'loginSuccess'): void
}

const emit = defineEmits<Emit>()

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

const tabStr = ref('login')
// const router = useRouter()
const registerForm = reactive({
  email: '',
  password: '',
  nickname: '',
  emailCode: '',
  phone: '',
  invite: '',
})
const loginForm = reactive({
  email: '',
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

    handleClick()
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}
</script>

<template>
  <NTabs

    v-model:value="tabStr"
    justify-content="space-evenly"
    type="line"
  >
    <NTabPane
      name="login"
      tab="登录"
    >
      <NForm
        ref="formRef"
        :model="loginForm"
        :style="{ maxWidth: '640px' }"
        class="auto"
        style="margin:0 auto;"
      >
        <NFormItem
          label="邮箱"
          path="email"
          :rule="{
            required: true,
            message: '请输入邮箱',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="loginForm.email"
            clearable
          />
        </NFormItem>
        <NFormItem
          label="密码"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="loginForm.password"
            type="password"
            show-password-on="mousedown"
          />
        </NFormItem>

        <NFormItem>
          <NSpace>
            <NButton
              attr-type="button"
              @click="loginEvent"
            >
              登录
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NTabPane>

    <NTabPane
      name="register"
      tab="注册"
    >
      <NForm
        ref="formRef"
        :model="registerForm"
        :style="{ maxWidth: '640px' }"
        class="auto"
        style="margin:0 auto;"
      >
        <NFormItem
          label="邮箱"
          path="email"
          :rule="{
            required: true,
            message: '请输入邮箱',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.email"
            clearable
          />
        </NFormItem>
        <NFormItem
          label="密码"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.password"
            type="password"
            show-password-on="mousedown"
          />
        </NFormItem>
        <NFormItem
          label="昵称"
          path="nickname"
          :rule="{
            required: true,
            message: '请输入昵称',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.nickname"
            clearable
          />
        </NFormItem>
        <NFormItem
          label="手机号"
          path="phone"
          :rule="{
            required: true,
            message: '请输入手机号',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.phone"
            clearable
          />
        </NFormItem>

        <NFormItem
          label="邮箱验证码"
          path="emailCode"
          :rule="{
            required: true,
            message: '请输入邮箱验证码',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.emailCode"
            clearable
          />
          <NButton
            style="margin-left: 12px"
            @click="sendCode"
          >
            {{ buttonInfo.text }}
          </NButton>
        </NFormItem>

        <NFormItem
          label="邀请人邮箱（双方都可获得5000moss）"
          path="email"
          :rule="{
            required: false,
            message: '',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput
            v-model:value="registerForm.invite"
            clearable
          />
        </NFormItem>

        <NFormItem>
          <NSpace>
            <NButton
              attr-type="button"
              @click="registerEvent"
            >
              注册
            </NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NTabPane>
  </NTabs>
</template>
