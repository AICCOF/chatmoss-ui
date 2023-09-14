<script lang="ts" setup>
import {
  useMessage,
} from 'naive-ui'
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { bindingStatus, getBindingWechatQrCode } from './../../../api/weixin'
import Page from '@/components/page/index.vue'
import { useBack, useGo } from '@/utils/router'
// const props = defineProps(['tab'])
const emit = defineEmits<Emit>()
const router = useRouter()
const back = useBack()
const go = useGo()
const ms = useMessage()
interface Emit {
  (e: 'loginSuccess'): void
}
const imgUrl = ref('')
function handleBack() {
  if (router.currentRoute.value.query && router.currentRoute.value.query.invite) {
    // console.log(router.currentRoute.value.query.invite)
    go({
      name: 'chat',
      query: {
        invite: router.currentRoute.value.query.invite,
      },
    })
  }
  else {
    back()
  }
}

let time = null
let expire_seconds = 0
getWechatLoginQrCodeAPI()

async function getWechatLoginQrCodeAPI() {
  clearInterval(time)
  const res = await getBindingWechatQrCode()
  expire_seconds = res.data.expire_seconds
  imgUrl.value = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURI(res.data.ticket)}`
  time = setInterval(() => {
    expire_seconds = expire_seconds - 3
    if (expire_seconds < 0)
      getWechatLoginQrCodeAPI()

    getTokenByTicketAPI()
  }, 2000)
}
async function getTokenByTicketAPI() {
  const res = await bindingStatus()
  if (res.data.wechat) {
    ms.info('绑定成功！！')
    clearInterval(time)
    handleBack()
  }
}
onUnmounted(() => {
  clearInterval(time)
})
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="绑定微信" left-text="返回" left-arrow @click-left="handleBack" />
    </template>

    <div class="wrap-main">
      <div class="title">
        绑定微信
      </div>
      <div class="content">
        <div class="content-wrap">
          <div>
            <div><img v-if="imgUrl" :src="imgUrl" class="code top" alt=""></div>
            <div class="text">
              👉 微信扫码关注公众号进行登录（微信和邮箱账号暂不互通）
            </div>
            <!-- <div class="bottom">
              登录即同意<span class="link">用户协议</span>和<span class="link">隐私条款</span>
            </div> -->
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
