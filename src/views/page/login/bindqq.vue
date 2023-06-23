<script lang="ts" setup>
import {
  useMessage,
} from 'naive-ui'
import { reactive, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Page from '@/components/page/index.vue'
// import { sendToMsg } from '@/utils/vsCodeUtils'
import { useBack, useGo } from '@/utils/router'
import { bandingEmailCode, doBindingEmail } from './../../../api/weixin'
// const props = defineProps(['tab'])
// const emit = defineEmits<Emit>()
const router = useRouter()
const back = useBack()
const go = useGo()
const message = useMessage()

let time = null;
const loginForm = reactive({
  email: '',
  emailCode: ''
})
const buttonInfo = reactive({
  text: '发送验证码',
  time: 0,
})

async function sendCode() {
  const res = await bandingEmailCode<{ msg: string }>({
    email: loginForm.email
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

async function bindEvent() {
  try {

    let res = await doBindingEmail({
      emailCode: loginForm.emailCode
    });
    message.info(res.msg, { duration: 5000 })
    handleBack();
  }
  catch (error: any) {
    message.info(error.msg, { duration: 5000 })
  }
}


</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="绑定邮箱" left-text="返回" left-arrow @click-left="handleBack" />
    </template>

    <div class="wrap-main">
      <div class="title">
        绑定邮箱
      </div>
      <div class="content">
        <div style="padding-bottom: 40px;">
          <div class="input">
            <input v-model="loginForm.email" type="text" placeholder="请输入登录邮箱">
          </div>
          <div class="input flex items-center">
            <input v-model="loginForm.emailCode" type="text" class="flex-1" placeholder="请输入验证码">
            <span class="send" @click="sendCode"> {{ buttonInfo.text }}</span>
          </div>
          <div class="login cursor-pointer" @click="bindEvent">
            绑定邮箱
          </div>
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
  // box-shadow: 0px 0px 10px #333;
  flex-direction: column;
  padding: 0;
}

.content-wrap {
  margin: 0 auto;
  margin-top: 40px;
  border-radius: 20px;
  width: 80%;
  box-shadow: 0px 0px 10px #333;
  position: relative;
  // padding:40px 20px;
  overflow: hidden;
  padding-top: 40px;

  .tip {
    height: 40px;
    min-width: 60px;
    position: absolute;
    top: 0px;
    right: 0px;
    padding-top: 10px;
    padding-right: 20px;
    color: #576B95;
    cursor: pointer;
  }

  .text {
    color: rgb(126, 128, 129)
  }

  .bottom {
    margin-top: 40px;
    text-align: left;
    background-color: #eeeeee;
    height: 40px;
    line-height: 40px;
    box-sizing: border-box;
    padding: 0 20px;
  }

  .link {
    color: rgb(87, 107, 149);
    padding: 0 2px;
  }
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

  .code {
    margin: 0 auto;
    width: 60%;
    max-width: 300px;
    max-height: 300px;
    height: 60%;
    // width:;
  }
}

.input {
  color: #9EA2B5;

  font-size: 14px;
  width: 80%;
  margin: 0 auto;
  margin-top: 20px;

  border-bottom: 1px solid #E6E6E6;

  input {
    height: 40px;
    width: 100%;
    padding: 10px 0px;
    display: block;
  }
}

.top {
  margin-top: 50px;
}

.bg {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxmaWx0ZXIgeD0iLTUuNyUiIHk9Ii04LjclIiB3aWR0aD0iMTEyLjQlIiBoZWlnaHQ9IjExNy40JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iYSI+PGZlT2Zmc2V0IGR4PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNy41IiBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiLz48ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuMTUgMCIgaW49InNoYWRvd0JsdXJPdXRlcjEiLz48L2ZpbHRlcj48cGF0aCBkPSJNMiAwaDMyNy41ODZhMSAxIDAgMDEuNzA3LjI5M2w0OS40MTQgNDkuNDE0YTEgMSAwIDAxLjI5My43MDdWMjY4YTIgMiAwIDAxLTIgMkgyYTIgMiAwIDAxLTItMlYyYTIgMiAwIDAxMi0yeiIgaWQ9ImIiLz48L2RlZnM+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMzMCkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHJlY3QgZmlsbD0iI0ZGRiIgd2lkdGg9IjM4MCIgaGVpZ2h0PSIyNzAiIHJ4PSIyIi8+PHBhdGggZD0iTTM2Ni44MzMgMTAuODMzdjIuMzM0aDIuMzM0di0yLjMzNGgtMi4zMzR6bS03IDE2LjMzNGgyLjMzNFYyOS41aC0yLjMzNHYtMi4zMzN6bTkuMzM0LTkuMzM0aDIuMzMzdjIuMzM0aC0yLjMzM3YtMi4zMzR6bS05LjMzNCA0LjY2N2gyLjMzNHYyLjMzM2gtMi4zMzRWMjIuNXptNC42NjctNC42NjdoMi4zMzN2Mi4zMzRIMzY0LjV2LTIuMzM0ek0zNTEuNjY3IDguNUgzNjFjLjY0NCAwIDEuMTY3LjUyMiAxLjE2NyAxLjE2N1YxOWMwIC42NDQtLjUyMyAxLjE2Ny0xLjE2NyAxLjE2N2gtOS4zMzNBMS4xNjcgMS4xNjcgMCAwMTM1MC41IDE5VjkuNjY3YzAtLjY0NS41MjItMS4xNjcgMS4xNjctMS4xNjd6bTEuMTY2IDIuMzMzdjdoN3YtN2gtN3ptMi4zMzQgMi4zMzRoMi4zMzNWMTUuNWgtMi4zMzN2LTIuMzMzem0xMC41LTQuNjY3aDQuNjY2Yy42NDUgMCAxLjE2Ny41MjIgMS4xNjcgMS4xNjd2NC42NjZjMCAuNjQ1LS41MjIgMS4xNjctMS4xNjcgMS4xNjdoLTQuNjY2YTEuMTY3IDEuMTY3IDAgMDEtMS4xNjctMS4xNjdWOS42NjdjMC0uNjQ1LjUyMi0xLjE2NyAxLjE2Ny0xLjE2N3ptMCAxNGg0LjY2NmMuNjQ1IDAgMS4xNjcuNTIyIDEuMTY3IDEuMTY3djQuNjY2YzAgLjY0NS0uNTIyIDEuMTY3LTEuMTY3IDEuMTY3aC00LjY2NmExLjE2NyAxLjE2NyAwIDAxLTEuMTY3LTEuMTY3di00LjY2NmMwLS42NDUuNTIyLTEuMTY3IDEuMTY3LTEuMTY3em0xLjE2NiAyLjMzM3YyLjMzNGgyLjMzNHYtMi4zMzRoLTIuMzM0ek0zNTEuNjY3IDIyLjVoNC42NjZjLjY0NSAwIDEuMTY3LjUyMiAxLjE2NyAxLjE2N3Y0LjY2NmMwIC42NDUtLjUyMiAxLjE2Ny0xLjE2NyAxLjE2N2gtNC42NjZhMS4xNjcgMS4xNjcgMCAwMS0xLjE2Ny0xLjE2N3YtNC42NjZjMC0uNjQ1LjUyMi0xLjE2NyAxLjE2Ny0xLjE2N3ptMS4xNjYgMi4zMzN2Mi4zMzRoMi4zMzR2LTIuMzM0aC0yLjMzNHoiIG9wYWNpdHk9Ii41IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii45Ii8+PHVzZSBmaWxsPSIjMDAwIiBmaWx0ZXI9InVybCgjYSkiIHhsaW5rOmhyZWY9IiNiIi8+PHVzZSBmaWxsPSIjRkZGIiB4bGluazpocmVmPSIjYiIvPjwvZz48L3N2Zz4=);
  background-repeat: no-repeat;
  background-position: top right;
}
</style>
