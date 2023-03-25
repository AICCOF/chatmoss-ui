<script setup lang='ts'>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { getToken } from '@/store/modules/auth/helper'
const emit = defineEmits<Emit>()

const userStore = useUserStore()

interface Emit {
  (e: 'login'): void
}

function loginEvent(e: Event) {
  const dom = e.target as Element
  if (dom && dom.className == 'vlogin')
    emit('login')
  if (dom && dom.className == 'vexit') {
    localStorage.removeItem('SECRET_TOKEN')
    location.reload()
  }
}

const showTips = computed(() => {
  const token = getToken() as string
  return token
    ? `剩余额度 <span class='number'>${(localStorage.getItem('apiKey') !== '' && localStorage.getItem('apiKey') !== null) ? '∞' : `${userStore.userInfo.residueCount}🤖`}</span>${localStorage.getItem('apiKey') ? ' ' : '（1🤖=10字）'}<span class='vexit'>退出登录</span>`
    : `
    <div><span class='vlogin'>未登录</span> 还可试用${userStore.userInfo.residueCount}🤖（1🤖=10字）
  `
})
onMounted(() => {
})
</script>

<template>
  <div class="tip-main">
    <van-notice-bar :scrollable="false">
      <van-swipe
        vertical
        class="notice-swipe"
        :autoplay="3000"
        :touchable="false"
        :show-indicators="false"
      >
        <van-swipe-item>小提示：生成的代码并不完全可靠</van-swipe-item>
        <van-swipe-item>消耗的🤖 和您的上下文长度有关</van-swipe-item>
        <van-swipe-item>ChatMoss已经开源：https://github.com/AICCOF</van-swipe-item>
        <van-swipe-item>ChatMoss开源已经交由 AI共建开源基金会托管（AICCOF）</van-swipe-item>
        <van-swipe-item>多支持官方将会加速官方的迭代速度哦~</van-swipe-item>
        <van-swipe-item>加入官方群，获取最新ChatMoss动态</van-swipe-item>
        <van-swipe-item>小提示：每天免费获得🤖 不能累加</van-swipe-item>
        <van-swipe-item>您当前使用的版本为v1.5.0</van-swipe-item>
      </van-swipe>
    </van-notice-bar>
    <div class="tip-text-content" @click="loginEvent" v-html="showTips" />
  </div>
</template>

<style lang="less">
.tip-main {
	display: flex;
}
.vlogin{
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size:12px;
}
.vexit{
  color: #FF6666;
  text-decoration: underline;
  cursor: grab;
  font-size:12px;
}
.number{
  color: #FF6666;
  cursor: grab;
  font-size:12px;
}
.notice-swipe {
  height: 40px;
  line-height: 40px;
}
.tip-text-content {
  font-size: 10px;
  color:#fff;
  width: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.van-notice-bar {
  width: 60%;
  background-color: #111114 !important;
  color: #fff;
  text-align: center;
  .van-notice-bar__wrap {
    display: flex;
    justify-content: center;
    .van-swipe-item {
      color: #FF6666;
      font-size: 10px;
    }
  }
}
</style>
