<script setup lang="ts">
import { reactive, ref } from 'vue'
import dayjs from 'dayjs'
// import { showImagePreview } from 'vant';
import { Empty, Input, Modal, Select, TabPane, Tabs, message } from 'ant-design-vue'
import { exchangeOptions } from './data'
import Page from '@/components/page/index.vue'
import { useBack } from '@/utils/router'
import {
  cancelPay,
  exchange,
  mallList,
  orderList,
  payPrePay,
  payStatus,
  payType,
  toMoss,
} from '@/api/shop'
import { useUserStore } from '@/store/modules/user'
const back = useBack()
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const activeName1 = ref('1')
const activeName = ref('')
const list = ref([])
const orderInfo = ref({})
const orderLists = ref([])
const alertInfo = ref({})
const payTypeInfo = reactive({
  list: [],
  textMap: {
    'wx-native': '微信直接购买',
    'alipay': '支付宝直接购买',
    'micro_store': '购买兑换码(折扣)',
  },
})
const show = ref(false)
const show1 = ref(false)
let timer: any = null
async function handlWechat(row, type) {
  clearInterval(timer)
  if (type.payType === 'micro_store') {
    alertInfo.value = {
      ...row,
      ...type,
    }
    show1.value = true
    console.log(alertInfo.value)
    return
  }
  const res = await payPrePay({
    payType: type.payType,
    productId: row.id,
  })
  orderInfo.value = res.data || []
  alertInfo.value = {
    ...row,
    ...type,
  }
  showPopup()
  timer = setInterval(() => {
    payStatusAPI(row, type)
  }, 2000)
}
const showPopup = () => {
  show.value = true
}
function handleClose() {
  console.log(222)
  clearInterval(timer)
  cancelPay({
    orderId: orderInfo.value.orderNo,
  })
}
async function payStatusAPI(row, type) {
  const res = await payStatus({
    orderId: orderInfo.value.orderNo,
    payType: alertInfo.value.payType,
    productId: alertInfo.value.id,
  })
  // console.log(res);

  if (res.status === 'SUCCESS') {
    show.value = false
    clearInterval(timer)
    message.info('购买成功')
  }
}

payType({}).then((res) => {
  // console.log(res)
  payTypeInfo.list = res.list
})
mallList().then((res) => {
  console.log(res, 'res')
  list.value = res.list || []
  // console.log(list);
  // orderLists.value = res.list[0].products;
})

const toMossCode = ref('')
const exchangeMossCode = ref('')
const userStore = useUserStore()

function handleTabs(i) {
  console.log('handleTabs')
  activeName1.value = i
  if (i === '2') {
    orderList({ pageSize: 1000, pageNum: 1 }).then((res) => {
      orderLists.value = res.rows || []
    })
  }
}

async function toMossEvent() {
  console.log('toMossCode', toMossCode.value)
  if (toMossCode.value === '') {
    message.error('请输入字符包兑换码，字符包点击下面继续购买，感谢您的支持')
    return
  }
  (await toMoss<any>({
    code: toMossCode.value,
  })) as any
  userStore.residueCountAPI()
  message.info('兑换成功，感谢您的支持！')
}

async function exchangeMossEvent() {
  if (!exchangeMossCode.value)
    return

  Modal.confirm({
    title: '兑换',
    content: '是否确定兑换此套餐？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await exchange({ itemId: exchangeMossCode.value })
      userStore.residueCountAPI()
      message.success('兑换成功')
    },
    onCancel: () => { },
  })
}
</script>

<template>
  <Page>
    <template #title>
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="back" />
    </template>
    <div
      class="flex" style="
      min-width:375px;
      margin: 0 auto;
      flex-direction: column;
      margin:0 auto;
      overflow: hidden;
      background: #fff;
    "
    >
      <div
        style="
        height: 70px;
        background: linear-gradient(90deg, #756df2 0%, #756df2 100%);
        text-align: center;
      "
      >
        <div style="color: #fff; font-size: 24px; font-weight: 600; line-height: 70px">
          ChatMoss 商店
        </div>
      </div>

      <div class="flex-1" style="overflow-y: auto">
        <div style="box-sizing: border-box; margin: 0 auto; margin-top: 30px; padding: 0 28px">
          <div class="title-h1">
            兑换码（登录后才能兑换哦~）
          </div>
          <div class="flex">
            <Input v-model:value="toMossCode" class="mr-2 input" type="text" placeholder="请输入您的兑换码" style="" />
            <div class="btn-exchange" @click="toMossEvent">
              兑换
            </div>
          </div>
        </div>

        <div style="box-sizing: border-box; margin: 0 auto; margin-top: 26px; padding: 0 28px">
          <div class="title-h1">
            字符兑换次数（老用户使用）
          </div>
          <div class="flex">
            <Select
              v-model:value="exchangeMossCode" :options="exchangeOptions" class="mr-2 avf exchange"
              placeholder="请选择兑换码"
            />
            <div class="btn-exchange" @click="exchangeMossEvent">
              兑换
            </div>
          </div>
        </div>

        <div>
          <div
            class="flex-center" style="
            box-sizing: border-box;
            width: 432px;
            height: 54px;
            margin: 0 auto;
            margin-top: 36px;
            overflow: hidden;
            border: 1px solid #756df2;
            border-radius: 8px 0 0 8px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 500;
            line-height: 54px;
          "
          >
            <div class="btn" :class="[activeName1 == '1' ? 'active' : '']" @click="handleTabs('1')">
              商城
            </div>
            <div class="btn" :class="[activeName1 == '2' ? 'active' : '']" @click="handleTabs('2')">
              购买记录
            </div>
          </div>
          <div>
            <div v-show="activeName1 == '1'" style="padding: 0 28px">
              <Tabs v-model="activeName" class="shop-content">
                <TabPane v-for="item of list" :key="item.index" :tab="item.grouTtitle" :name="item.index">
                  <div
                    v-for="(row, index) in item.products" :key="index" class="card"
                    :class="[index < item.products.length - 1 ? 'border' : '']"
                  >
                    <div>
                      <div>
                        <div class="title">
                          {{ row.title }}
                        </div>
                        <div class="desc mt-1">
                          {{ row.desc }}
                        </div>
                        <div class="mt-1 flex">
                          <div v-for="(tagItem, tagIndex) in row.tags" :key="tagIndex" class="tag">
                            {{ tagItem }} &nbsp;
                          </div>
                        </div>
                        <div class="flex-center" style="margin-top: 14px">
                          <span class="price mr-1">¥<span
                            style="margin-left: 6px; font-size: 20px; font-weight: bold"
                          >{{
                            row.price / 100
                          }}</span></span><span class="originPrice" style="text-decoration: line-through">
                            <span>¥</span>
                            <span>{{ row.originPrice / 100 }}</span></span>
                        </div>
                      </div>
                    </div>

                    <div class="text-center">
                      <div v-for="data of payTypeInfo.list" :key="data.payType" class="mt-2">
                        <div
                          :class="data.payType === 'wx-native' ? 'btn_success' : 'btn_primary'"
                          @click="handlWechat(row, data)"
                        >
                          {{ payTypeInfo.textMap[data.payType] }}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
            <div v-show="activeName1 == '2'" style="padding: 0 28px">
              <div v-if="orderLists.length === 0" style="padding-top: 30px">
                <Empty :image="simpleImage" description="暂无数据" />
              </div>
              <div v-if="orderLists.length !== 0">
                <div v-for="(row, index) in orderLists" :key="index" class="order_list">
                  <div class="flex-center" style="justify-content: space-between; margin-top: 8px">
                    <span>实付款</span>
                    <span style="color: #f53f3f">¥ &nbsp;<span style="font-size: 20px; font-weight: 600">{{
                      row.amount / 100
                    }}</span></span>
                  </div>
                  <div class="flex-center" style="justify-content: space-between; margin-top: 2px">
                    <span>订单编号</span>
                    <div class="flex-center" style="color: #717172">
                      <span>{{ row.payOrderNo }}</span>
                      <span style="margin: 0 12px; color: #e2e2e2">|</span>
                      <span style="color: #1c212a; cursor: pointer">复制</span>
                    </div>
                  </div>
                  <div class="flex-center" style="justify-content: space-between; margin-top: 2px">
                    <span>套餐信息</span>
                    <div style="width: 272px; color: #717172; text-align: right">
                      {{
                        row.prodDesc
                      }}
                    </div>
                  </div>
                  <div class="flex-center" style="justify-content: space-between; margin-top: 2px">
                    <span>购买时间</span>
                    <div style="color: #717172">
                      {{
                        dayjs(row.payTime).format('YYYY-MM-DD HH:mm:ss')
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal
      v-model:visible="show" class="self-model" :centered="true" :title="null" :footer="null"
      style="width: fit-content" @cancel="handleClose"
    >
      <div style="width: 416px" class="flex items-center justify-center">
        <div>
          <div
            class="text-center flex items-center justify-center"
            style="width: 416px; height: 70px; border-bottom: 1px solid #e4e4e4"
          >
            <img :src="alertInfo.url" alt="" style="width: 120px" class="mr-1">
          </div>
          <div class="mt-2 text-center" style="margin-top: 24px">
            {{ alertInfo.title }}
          </div>
          <div>
            <img
              class="zf-img" :src="orderInfo.payParam.url" alt=""
              style="display: block; width: 170px; margin: 0 auto; margin-top: 0"
            >
          </div>
          <div class="text-center" style="margin-top: 30px; margin-bottom: 20px; color: red; font-size: 16px">
            需支付：{{
              alertInfo.price / 100 }}
          </div>
          <div class="tip-text-input1">
            虚拟商品，不支持退款，请再三考虑是否需要购买
          </div>
        </div>
      </div>
    </Modal>
    <Modal
      v-model:visible="show1" :centered="true" :title="null" :footer="null" class="self-model"
      style="width: fit-content" @cancel="handleClose"
    >
      <div class="flex items-center justify-center" style="width: 416px">
        <div>
          <div
            style="
              width: 416px;
              height: 70px;
              border-radius: 16px 16px 0 0;
              background: #756df2;
              color: #fff;
              font-size: 20px;
              font-weight: 600;
              line-height: 70px;
              text-align: center;
            "
          >
            支付宝或者微信扫码即可购买
          </div>
          <div class="mt-2 text-center" style="margin-top: 24px">
            {{ alertInfo.title }}
          </div>
          <div>
            <img
              :src="alertInfo.microImg" class="mt-2 img-center" alt=""
              style="display: block; width: 170px; margin: 0 auto; margin-top: 20px"
            >
          </div>
          <div class="text-center" style="margin-top: 30px; margin-bottom: 20px; color: red; font-size: 16px">
            需支付：{{
              alertInfo.price / 100 }}
          </div>
          <div class="tip-text-input1">
            虚拟商品，不支持退款，请再三考虑是否需要购买
          </div>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<style lang="less">
.shop-content {
  margin-top: 14px !important;

  &.ant-tabs {
    .ant-tabs-nav-list {
      justify-content: space-between;
      width: 500px !important;
    }
  }

  .ant-tabs-nav-wrap {
    border-bottom: 1px solid #e6e6e8;
  }

  .ant-tabs-tab {
    color: #9a9a9c;
    font-size: 16px;

    &:hover {
      // color: #9a9a9c;todo
      color: #756df2;
    }

    &.ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: #756df2;
        font-size: 18px;
      }
    }
  }

  .ant-tabs-ink-bar {
    background: #756df2;
  }
}

.exchange {
  // width: 321px;
  width: 100%;
  height: 40px;

  // padding: 10px 0;
  .ant-select-selector {
    height: 40px !important;
    padding: 4px 20px !important;
    border-radius: 8px !important;
  }
}
</style>

<style lang="less" scoped>
.order_list {
  box-sizing: border-box;
  // display: flex;
  // align-items: center;
  // justify-content: space-between;
  // min-width: 432px;
  height: 181px;
  padding: 20px 0;
  border-bottom: 1px solid #e2e2e2;
  color: #1c212a;
  font-size: 14px;
  margin: 0 auto;
}

.tip-text-input1 {
  padding-bottom: 34px;
  color: #9a9a9c;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
}

.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 177px;
  color: #1c212a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  border: 0;

  &.border {
    // border-bottom: 1px solid #e2e2e2;
  }

  .title {
    color: #1c212a;
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  .desc {
    color: #1c212a;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }

  .tag {
    margin-right: 4px;
    color: #b0b0b0;
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
  }

  .price {
    // width: 90px;
    height: 30px;
    margin-right: 14px;
    padding: 4px 16px;
    border-radius: 15px;
    background: #fef4f3;
    color: #f53f3f;
    // font-size: 20px;
  }

  .originPrice {
    color: #f53f3f;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }

  .btn_success {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    height: 44px;
    border-radius: 8px;
    background: #f53f3f;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    cursor: pointer;
  }

  .btn_primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    height: 44px;
    border: 1px solid #605dff;
    border-radius: 8px;
    background: #fff;
    color: #605dff;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    cursor: pointer;
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 216px;
  height: 100%;
  color: #1c212a;
  font-size: 18px;
  font-weight: 500;
  line-height: 25px;
  cursor: pointer;

  &.active {
    background: #756df2;
    color: #fff;
  }
}

.input {
  box-sizing: border-box;
  // width: 321px;
  height: 40px;
  padding: 10px 24px;
  border: 1px solid #cdcdcd;
  border-radius: 8px;
  background: #fff;
  color: #1c212a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.title-h1 {
  margin-bottom: 14px;
  color: #9a9a9c;
  font-size: 18px;
  font-weight: 500;
  line-height: 25px;
}

.btn-exchange {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 99px;
  height: 40px;
  border: 1px solid #756df2;
  border-radius: 8px;
  background: #fff;
  color: #605dff;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}
</style>
