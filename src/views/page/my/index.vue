<script lang="ts" setup>
import { ref } from 'vue'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { getToken } from '@/store/modules/auth/helper'
import item1 from '@/assets/my/item1.png'
import item2 from '@/assets/my/item2.png'
import item3 from '@/assets/my/item3.png'
import item4 from '@/assets/my/item4.png'
import item5 from '@/assets/my/item5.png'
import item6 from '@/assets/my/item6.png'

import card1 from '@/assets/my/card1.png'
import card2 from '@/assets/my/card2.png'
import card3 from '@/assets/my/card3.png'
import card4 from '@/assets/my/card4.png'
const back = useBack()

let infoList = ref([
  { title: '设置', img: item1 },
  { title: '客服', img: item2 },
  { title: '反馈', img: item3 },
  { title: '帮助', img: item4 },
  { title: '统计', img: item5 },
  { title: '分销', img: item6 }
])

let cardList = ref([
  { title: '实名认证', img: card1 },
  { title: '隐私协议', img: card2 },
  { title: '用户协议', img: card3 },

])
// { title: '退出登录', img: card4 },

</script>

<template>
  <div class="main">
    <div class="flex items-center justify-between" style="
      margin: 0 auto;
      padding:0 16px;
      width: 347px;
      height: 87px;
      background: #FFFFFF;
      box-shadow: 0px 3px 13px 0px rgba(234,237,246,1);
      border-radius: 11px;
    ">
      <div class="flex items-center">
        <div style="
        margin-right: 13px;
        overflow: hidden;
        border-radius: 50%;
        width: 57px;
        height: 57px;
        background: #000000;
      ">
          <img src="@/assets/avatar.jpg" style="width:100%;height:100%" alt="">
        </div>
        <div>
          <div style="
        font-size: 18px;
        font-weight: 500;
        color: #1A1A1A;
        line-height: 25px;
        ">这里是用户名</div>
          <div style="
        font-size: 13px;
        font-weight: 400;
        color: #828793;
        line-height: 19px;"><span style="display: inline-block;width: 17px;
        height: 17px;
        background: #E3E7F9;
        border-radius: 2px;font-size: 12px;
        font-weight: 400;
        color: #7196F4;
        line-height: 17px;
        text-align: center;
        ">ID</span> <span>123456</span></div>
        </div>
      </div>
      <div>
        <img src="@/assets/my/icon-arrow-right.png" style="width: 8px;" alt="">
      </div>
    </div>

    <div class="card flex justify-center justify-between flex-wrap "
      style="margin-top: 18px;padding:0 16px;padding-bottom: 15px;">
      <div class="info mt-[14px]" v-for="(item, i) of infoList" :key="i">
        <div class="w-[50px] h-[50px] m-auto mt-[15px]">
          <img :src="item.img" alt="">
        </div>
        <div style="
        text-align: center;
        font-size: 16px;
        font-weight: 400;
        color: #1A1A1A;
        line-height: 22px;
        margin-top: 6px;
        ">{{ item.title }}</div>

      </div>

    </div>

    <div class="card " style="margin-top: 14px;">
      <div v-for="(item, i) of cardList" class="px-[16px]">
        <div class="my-border flex items-center justify-between m-auto w-[100%] h-[40px]">
          <div class="flex items-center ">
            <img :src="item.img" style="width: 22px;" alt="">
            <div style="
            margin-left: 11px;
            font-size: 16px;
            font-weight: 400;
            color: #1A1A1A;
            line-height: 22px;
            ">{{ item.title }}</div>
          </div>
          <div>
            <img src="@/assets/my/icon-arrow-right.png" style="width: 8px;" alt="">
          </div>
        </div>
      </div>
    </div>

    <div class="card " style="margin-top: 14px;">
      <div class="px-[16px]">
        <div class="my-border flex items-center justify-between m-auto w-[100%] h-[40px]">
          <div class="flex items-center ">
            <img :src="card4" style="width: 22px;" alt="">
            <div style="
            margin-left: 11px;
            font-size: 16px;
            font-weight: 400;
            color: #1A1A1A;
            line-height: 22px;
            ">退出登录</div>
          </div>
          <div>
            <img src="@/assets/my/icon-arrow-right.png" style="width: 8px;" alt="">
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="less" scoped>
.my-border {
  border-bottom: 1px solid #F6F7FA;
}

.card {
  box-sizing: border-box;
  margin: 0 auto;
  width: 347px;
  background: #FFFFFF;
  border-radius: 11px;
}

.info {
  width: 96px;
  height: 107px;
  background: linear-gradient(180deg, #FDFDFD 0%, #F6F7F9 100%);
  border-radius: 9px;
  border: 1px solid #F1F3F4;
}

.main {
  min-height: 100vh;
  padding-top: 74px;
  background-image: url('@/assets/my/bg.png');
  background-color: #F6F7FA;
  // background: #F6F7FA;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>