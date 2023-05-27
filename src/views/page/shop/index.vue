<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NCard, NDivider, NInput, NModal, NSelect, useDialog, useMessage } from 'naive-ui'
import { ShopInfo, exchangeOptions } from './data'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import { toMoss } from '@/api'
import { useUserStore } from '@/store'
import { exchange } from '@/api/personCenter'

const personCenter = ref(ShopInfo)
const ms = useMessage()
const userStore = useUserStore()
const activeName = ref('')
const back = useBack()
// 兑换字符数
const toMossCode = ref('')
const shopModal = ref(false)
const shopData = ref({
  title: '',
  shopImg: '',
})
async function toMossEvent() {
  if (toMossCode.value === '') {
    ms.error('请输入字符包兑换码，字符包点击下面继续购买，感谢您的支持', { duration: 5000 })
    return
  }
  try {
    await toMoss<any>({
      code: toMossCode.value,
    }) as any
    userStore.residueCountAPI()
    ms.info('兑换成功，感谢您的支持！', { duration: 5000 })
  }
  catch (error: any) {
    ms.error(error.msg, { duration: 5000 })
  }
}
function buyEvent(item: any) {
  shopModal.value = true
  shopData.value = item
}

const exchangeMossCode = ref('')

const dialog = useDialog()
async function exchangeMossEvent() {
  if (!exchangeMossCode.value)
    return

  dialog.info({
    title: '兑换',
    content: '是否确定兑换此套餐？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await exchange({ itemId: exchangeMossCode.value })
        userStore.residueCountAPI()
        ms.success('兑换成功', { duration: 5000 })
      }
      catch (error: any) {
        ms.error(error.msg, { duration: 5000 })
      }
    },
    onNegativeClick: () => {

    },
  })
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="ChatMoss商店" left-text="返回" left-arrow @click-left="back" />
    </template>
    <div class="shop-main">
      <div>
        <div class="title-h1">
          兑换码（登录后才能兑换哦~）
        </div>
        <div class="flex">
          <NInput v-model:value="toMossCode" class="mr-2" type="text" placeholder="请输入您的兑换码" />
          <NButton type="primary" ghost @click="toMossEvent">
            确定
          </NButton>
        </div>
      </div>
      <NDivider />

      <div>
        <div class="title-h1">
          字符兑换包月模式
        </div>
        <div class="flex">
          <NSelect v-model:value="exchangeMossCode" :options="exchangeOptions" class="mr-2" placeholder="请输入您的兑换码" />
          <NButton type="primary" ghost @click="exchangeMossEvent">
            确定
          </NButton>
        </div>
      </div>
      <NDivider />

      <van-tabs v-model:active="activeName" class="dark:text-white">
        <van-tab title="4.0模型套餐" name="a">
          <div class="tip-text-input1">
            小提示：不同的套餐次数可以累加
          </div>
          <div class="tip-text-input1" />
          <div class="flex flex-wrap">
            <div
              v-for="(item, index) of personCenter.shopsV4" :key="index" :class="{ 'border-div': index === 0 }"
              class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer"
              @click="buyEvent(item)"
            >
              <div class="title-h2">
                {{ item.title }}
              </div>
              <div class="desc">
                {{ item.desc }}
              </div>
              <div class="desc">
                ￥ {{ item.count }}
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="3.0模型套餐" name="b">
          <div class="tip-text-input1">
            小提示：不同的套餐次数可以累加
          </div>
          <div class="tip-text-input1" />
          <div class="flex flex-wrap">
            <div
              v-for="(item, index) of personCenter.shopsV3" :key="index" :class="{ 'border-div': index === 0 }"
              class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer "
              @click="buyEvent(item)"
            >
              <div class="title-h2">
                {{ item.title }}
              </div>
              <div class="desc">
                {{ item.desc }}
              </div>
              <div class="desc">
                ￥ {{ item.count }}
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="字符包" name="c">
          <div class="flex flex-wrap">
            <div
              v-for="(item, index) of personCenter.shops" :key="index" :class="{ 'border-div': index === 0 }"
              class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer"
              @click="buyEvent(item)"
            >
              <div class="title-h2">
                {{ item.title }}
              </div>
              <div class="desc">
                {{ item.desc }}
              </div>
              <div class="desc">
                ￥ {{ item.count }}
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 购买字符数 -->
    <NModal v-model:show="shopModal">
      <NCard
        style="width: 400px" :title="shopData.title" size="huge" role="dialog" aria-modal="true"
        :mask-closable="true"
      >
        <div class="tip-text-input2">
          支付宝扫码购买（暂不支持微信）
        </div>
        <img class="shop-img" :src="shopData.shopImg" alt="">
        <div class="tip-text-input3">
          您的支持就是我们的动力，我们会持续迭代本软件，提供更多更方便的功能！
        </div>
      </NCard>
    </NModal>
  </Page>
</template>

<style>
.title-h1 {
  margin: 10px 0px;
  color: #FF6666;
}

.title-h2 {
  color: #FF6666;
}

.tip-text-input1 {
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.tip-text-input2 {
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
  color: #FF6666;
  text-align: center;
}

.tip-text-input3 {
  font-size: 12px;
  margin-top: 20px;
  text-align: center;
}

.shop-img {
  min-width: 260px;
  min-height: 260px;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.shop-main {
	padding: 0 15px;
	padding-top: 10px;
	padding-bottom: 20px;
}
</style>
