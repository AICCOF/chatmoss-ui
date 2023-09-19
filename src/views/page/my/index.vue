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


// { title: '退出登录', img: card4 },
// https://h5.aihao123.cn/pages/app/help/index.html
</script>

<template>
  <div class="main">
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
    <div class="member cursor-pointer relative" @click="handleMember" :class="['member' + userStore.userInfo.userLevel]">

      <img src="@/assets/member/member_bg.png" alt="" style="position: absolute;left:0;top:0;width: 100%;height: 100%;">
      <div class="flex justify-between items-center">
        <div class="flex items-center justify-between title">
          <img src="@/assets/my/member/icon-01.png" class="mr-[7px]" alt="" style="width: 22px;height: 22px;">
          <span class="top font-bold">Lv{{ userStore.userInfo.userLevel }}等级</span>
        </div>
        <div class="flex  items-center" style="opacity: 0.3;">
          <span>查看</span>
          <SvgIcon icon="mingcute:right-fill" class="icon" style="font-size: 16px;" />
        </div>
      </div>
      <div class="flex items-center justify-between mt-[13px]" style="opacity: 0.5;">
        <div class="flex  items-center " >
          <span class="iconfont icon-a-35-16gongzuorishiyong
" style="font-size: 24px">
          </span>
          <span >模型免费用</span>
        </div>
        <div class="flex items-center">
          <span class="iconfont icon-keyishiyongchajian
" style="font-size: 24px"> </span>
          <span >多插件提效</span>
        </div>
        <div class="flex  items-center">
          <span class="iconfont icon-tishicimoban
" style="font-size: 24px"> </span>
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
  // background: linear-gradient(45deg, #221A2A 0%, #3E3646 100%);
  background-image: linear-gradient(45deg, #A0C1E1 0%, #DCEFFB 100%);
  // box-shadow: inset 0px 1px 5px 0px rgba(31, 26, 36, 1);
  border-radius: 11px;
  box-sizing: border-box;
  padding: 16px 15px;
  font-size: 11px;
  font-weight: 400;
  color: #BBAAA5;
  line-height: 16px;

  .title {
    font-size: 14px;
  }

  img {
    width: 17px;
    height: 17px;
  }

  &.member1 {
    background-image: linear-gradient(45deg, #A0C1E1 0%, #DCEFFB 100%);
    border: 1px solid #FFFFFF;
    color: #496682;

    .top {
      color: #2B4365;
    }

    .title {
      color: #2B4365;
    }
  }

  &.member2 {
    background-image: linear-gradient(45deg, #ADC9FA 0%, #EDF4FD 100%);
    border: 1px solid #9ebbf4;
    color: #313775;

    .top {
      color: #202F67;
    }

    .title {
      color: #202F67;
    }
  }

  &.member3 {
    background-image: linear-gradient(45deg, #F8D8BF 0%, #FDF2EB 100%);
    color: #80543D;
    border: 1px solid #ffe7d4;

    .top {
      color: #5C3626;
    }

    .title {
      color: #5C3626;
    }
  }

  &.member4 {
    background-image: linear-gradient(45deg, #AABDEB 0%, #DBE5F1 50%, #EBF0F6 100%);
    color: #454D65;
    border: 1px solid #deeaef;

    .top {
      color: #454D65;
    }

    .title {
      color: #454D65;
    }
  }

  &.member5 {
    background-image: linear-gradient(45deg, #EFD49A 0%, #F5E3C1 100%);
    color: #B48C53;
    border: 1px solid #fad696;

    .top {
      color: #7A4A25
    }

    .title {
      color: #7A4A25;
    }
  }

  &.member6 {
    background-image: linear-gradient(45deg, #DBAD8B 0%, #F7EBD7 48%, #F3DBBC 100%);
    color: #A8713F;
    border: 1px solid #fcf4e1;

    .top {
      color: #4B321B;
    }

    .title {
      color: #4B321B;
    }
  }

  &.member7 {
    background-image: linear-gradient(45deg, #1C162F 0%, #3F3368 100%);
    color: #FFFFFF;
    border: 1px solid #cbbbff;

    .top {
      color: #F1E4F7;
    }

    .title {
      color: #F1E4F7;
    }
  }

  &.member8 {
    background-image: linear-gradient(45deg, #1E1E2E 0%, #3A3A52 100%);;
    color: #FFFFFF;
    border: 1px solid #333453;

    .top {
      color: #E4E4F7;
    }

    .title {
      color: #F1E4F7;
    }
  }

  &.member9 {
    background-image: linear-gradient(45deg, #141015 0%, #333030 100%);
    box-shadow: inset 0px 1px 5px 0px rgba(31, 26, 36, 1);
    color: #FFFFFF;
    border: 1px solid #494748;

    .top {
      color: #F5D3BF;
    }


    .title {
      color: #F5D3BF;
    }
  }

  &.member10 {
    background-image: linear-gradient(45deg, #221A2A 0%, #3E3646 100%);
    box-shadow: inset 0px 1px 5px 0px rgba(31, 26, 36, 1);
    color: #BBAAA5;
    border: 1px solid #bfa7b0;

    .top {
      color: #F7E9E0;
    }

    .title {
      color: #F7E9E0;
    }
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
  box-shadow: 0px 2px 15px 0px rgba(220, 224, 239, 1);

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
  height: 100%;
  padding-top: 74px;
  max-width: 1000px;
  margin: 0 auto;
  background-size: contain;
  background-image: url('https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/chatmoss/v5.4/my/bg.png');
  background-color: #F6F7FA;
  // background: #F6F7FA;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: scroll;
  padding-bottom: 74px;
}
</style>
