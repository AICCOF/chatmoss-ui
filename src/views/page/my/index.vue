<script lang="ts" setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { useGo } from '@/utils/router'
import { sendToMsg } from '@/utils/vsCodeUtils'
import { useUserStore } from '@/store'
import { useAuthStoreWithout, useChatStore } from '@/store/modules'
import { SvgIcon } from '@/components/common'
import { openWebView } from '@/utils/jumpLink'
const go = useGo()
const chatStore = useChatStore()
const userStore = useUserStore()
const useAuthStore = useAuthStoreWithout()
userStore.residueCountAPI()

const infoList = ref([
  { title: '设置', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item1.png', callBack: () => { go({ name: 'setting' }) } },
  { title: '在线客服', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item2.png', callBack: () => { openWebView('https://wpa1.qq.com/J3gC8UbU?_type=wpa&qidian=true') } },
  { title: '问题反馈', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item3.png', callBack: () => { openWebView('https://chatmoss.feishu.cn/share/base/form/shrcnayy8oLPuz44E8fd0Nkztug') } },
  {
    title: '帮助文档',
    img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item4.png',
    callBack: () => {
      go({
        name: 'h5',
        query: {
          url: 'https://h5.aihao123.cn/pages/app/help/index.html',
        },
      })
    },
  },
  { title: '使用统计', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item5.png', callBack: () => { showToast('即将开放，敬请期待~') } },
  // { title: '分销', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/item6.png', callBack: () => { showToast('即将开放，敬请期待~') } }
])

const cardList = ref([
  // { title: '实名认证', img: card1, callBack: () => { window.open('https://wpa1.qq.com/J3gC8UbU?_type=wpa&qidian=true','_blank'); } },
  { title: '隐私协议', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/card2.png', callBack: () => { openWebView('https://chatmoss.feishu.cn/wiki/YqbswQDH3iSaltkVMv4cjzghn5c') } },
  { title: '用户协议', img: 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/card3.png', callBack: () => { openWebView('https://chatmoss.feishu.cn/wiki/DRwDwcl5EiO9YakBPHgcAcD8n3e') } },

])

function logout() {
  useAuthStore.setToken('')
  sendToMsg('chatMossToken', '')
  chatStore.clearList()
  userStore.residueCountAPI()
  go({ name: 'chat' })
}

function handleLogin() {
  if (!userStore.userInfo.user)
    go({ name: 'login' })
}

function handleClick(row) {
  if (row.callBack)
    row.callBack()
}

function goSetting() {
  go({
    name: 'h5',
    query: {
      url: 'https://h5.aihao123.cn/pages/app/acount/index.html',
    },
  })
}
function handleMember() {
  go({
    name: 'h5',
    query: {
      url: 'https://h5.aihao123.cn/pages/app/memberCenter/index.html',
    },
  })
}
function handleNotice() {
   go({
    name: 'h5',
    query: {
      url: 'https://h5.aihao123.cn/pages/app/notice/index.html',
    },
  })
}

// { title: '退出登录', img: card4 },
// https://h5.aihao123.cn/pages/app/help/index.html
</script>

<template>
  <div class="main">
    <div class="flex justify-end w-[375px] m-auto">
      <div class="relative mr-[15px]">
        <van-badge :content="(userStore.redCount > 0) ? userStore.redCount : undefined"
          style="position: absolute;right: 10px;top:5px" @click="handleNotice">
        </van-badge>
        <img src="@/assets/my/member/notice.png" alt="" style="width: 36px;height: 36px;">
      </div>


    </div>
    <div class="flex items-center justify-between" style="
      margin: 0 auto;
      padding:0 16px;
      width: 347px;
      height: 87px;
    " @click="handleLogin">
      <div class="flex items-center">
        <div class="flex items-center justify-center" style="
          margin-right: 13px;
          overflow: hidden;
          border-radius: 50%;
          width: 57px;
          height: 57px;
          background: #FFFFFF;
          ">
          <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo.svg" style="width:80%;height:80%"
            alt="">
        </div>
        <div>
          <div style="
            font-size: 18px;
            font-weight: 500;
            color: #1A1A1A;
            line-height: 25px;
          ">
            <span v-if="userStore.userInfo.customAccount">{{ userStore.userInfo.customAccount }}</span>
            <span v-else>
              {{ userStore.userInfo.user ? userStore.userInfo.user.nickname : '未登录' }}
            </span>
          </div>
          <div v-if="userStore.userInfo.user" style="
            font-size: 13px;
            font-weight: 400;
            color: #828793;
            line-height: 19px;
        ">
            <span style="
            display: inline-block;
            width: 17px;
            height: 17px;
            background: #E3E7F9;
            border-radius: 2px;
            font-size: 12px;
            font-weight: 400;
            color: #7196F4;
            line-height: 17px;
            text-align: center;
        ">ID</span><span> {{ userStore.userInfo.user.uid }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center cursor-pointer">

        <span v-if="userStore.userInfo.hideCustomAccount === 0" @click="goSetting"
          style=" font-size: 13px;font-weight: 400;line-height: 19px;">
          <span v-if="!userStore.userInfo.customAccount" style="
             color: #FF536F;
            ">去设置账号</span>
          <span v-if="userStore.userInfo.customAccount" style="
            color: #828793;
            ">修改账号</span>
        </span>

        <SvgIcon icon="mingcute:right-fill" class="icon" style="color: #DFE1E8;font-size: 16px;" />
      </div>
    </div>
    <div class="member cursor-pointer" @click="handleMember">
      <div class="flex justify-between items-center">
        <div class="flex  items-center justify-between">
          <img src="@/assets/my/member/icon-01.png" class="mr-[7px]" alt="" style="width: 22px;height: 22px;">
          <span>Lv{{ userStore.userInfo.memberLevel }}会员</span>
        </div>
        <div class="flex  items-center">
          <span>查看</span>
          <SvgIcon icon="mingcute:right-fill" class="icon" style="color: #DFE1E8;font-size: 16px;" />
        </div>
      </div>
      <div class="flex items-center justify-between mt-[13px]">
        <div class="flex  items-center ">
          <img src="@/assets/my/member/icon-item01.png" class="mr-[7px]" alt="">
          <span>模型免费用</span>
        </div>
        <div class="flex items-center">
          <img src="@/assets/my/member/icon-item02.png" class="mr-[7px]" alt="">
          <span>多插件提效</span>
        </div>
        <div class="flex  items-center">
          <img src="@/assets/my/member/icon-item03.png" class="mr-[7px]" alt="">
          <span>提示词模版</span>
        </div>
      </div>
    </div>

    <div class="card flex justify-start  flex-wrap " style="margin-top: 18px;padding:0 4px;padding-bottom: 15px;">
      <div v-for="(item, i) of infoList" :key="i" class="info mt-[14px] ml-[6px] mr-[6px] cursor-pointer card-item"
        @click="handleClick(item)">
        <div class="w-[50px] h-[50px] m-auto mt-[15px]">
          <img :src="item.img" alt="">
        </div>
        <div class="text" style="
        ">
          {{ item.title }}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 14px;">
      <div v-for="(item, i) of cardList" :key="i" class="card-item px-[16px] cursor-pointer" @click="handleClick(item)">
        <div class="my-border flex items-center justify-between m-auto w-[100%] h-[46px] ">
          <div class="flex items-center ">
            <img :src="item.img" style="width: 22px;" alt="">
            <div class="title" style="
            ">
              {{ item.title }}
            </div>
          </div>
          <div>
            <SvgIcon icon="mingcute:right-fill" class="icon" />
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 14px;">
      <div class="px-[16px] cursor-pointer card-item" @click="logout">
        <div class="my-border flex items-center justify-between m-auto w-[100%] h-[46px]">
          <div class="flex items-center ">
            <img src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/card4.png"
              style="width: 22px;" alt="">
            <div class="title">
              退出登录
            </div>
          </div>

          <div>
            <SvgIcon icon="mingcute:right-fill" class="icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.member {
  width: 347px;
  height: 80px;
  margin: 0 auto;
  background: linear-gradient(45deg, #221A2A 0%, #3E3646 100%);
  box-shadow: inset 0px 1px 5px 0px rgba(31, 26, 36, 1);
  border-radius: 11px;
  box-sizing: border-box;
  padding: 16px 15px;
  font-size: 11px;
  font-weight: 400;
  color: #BBAAA5;
  line-height: 16px;

  img {
    width: 17px;
    height: 17px;
  }

}

.my-border {
  border-bottom: 1px solid #F6F7FA;
}

.card {
  box-sizing: border-box;
  margin: 0 auto;
  width: 347px;
  background: #FFFFFF;
  border-radius: 11px;

  .card-item {
    .text {
      text-align: center;
      font-size: 16px;
      font-weight: 400;
      color: #1A1A1A;
      line-height: 22px;
      margin-top: 6px;
    }

    .title {
      text-align: center;
      font-size: 16px;
      font-weight: 400;
      color: #1A1A1A;
      line-height: 22px;
      margin-left: 15px;
    }

    .icon {
      color: #dfe1e8;
      font-size: 16px;
    }

    &:hover {
      .title {
        color: #A4A4A6;
      }

      .icon {
        color: #BEC5DE;
      }
    }
  }

}

.info {
  width: 96px;
  height: 107px;
  background: linear-gradient(180deg, #FDFDFD 0%, #F6F7F9 100%);
  border-radius: 9px;
  border: 1px solid #F1F3F4;

  &:hover {
    border: 1px solid #BEC5DE;
  }
}

.main {
  // width: 375px;
  min-height: 100%;
  padding-top: 74px;
  max-width: 1000px;
  margin: 0 auto;
  background-size: contain;
  background-image: url('https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/bg.png');
  background-color: #F6F7FA;
  // background: #F6F7FA;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
