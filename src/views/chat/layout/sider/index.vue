<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NDivider, NInput, NLayoutSider, NModal, useMessage } from 'naive-ui'
import Tips from '../../tips.vue'
import { useModel } from '../../components/Modal/hooks/useModal'
import List from './List.vue'
import Footer from './Footer.vue'
import PersonCenter from './../../components/PersonCenter.vue'
import Login from '@/views/login/index.vue'
import { useAppStore, useChatStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { getToken } from '@/store/modules/auth/helper'
import { toMoss } from '@/api'
import { defaultState } from '@/store/modules/chat/helper'
import { ss } from '@/utils/storage'
const person = ref(null) as any
const [registerModal, { openModel }] = useModel()
const userStore = useUserStore()
const showModal = ref(false)
const ms = useMessage()
const appStore = useAppStore()
const chatStore = useChatStore()
const token = ref(getToken())

const { isMobile } = useBasicLayout()
const tab = ref('login')
const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: '新建问题', uuid: Date.now(), isEdit: false })
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

// 兑换字符数
const toMossCode = ref('')
async function toMossEvent() {
  if (toMossCode.value === '') {
    ms.error('请输入字符包兑换码，字符包点击下面继续购买，感谢您的支持', { duration: 5000 })
    return
  }
  try {
    const data = await toMoss<any>({
      code: toMossCode.value,
    }) as any
    userStore.residueCountAPI()
    ms.info(`兑换成功，您已经增加${Number(data.msg) * 10}字符数，感谢您的支持！`, { duration: 5000 })
  }
  catch (error: any) {
    ms.error(error.msg, { duration: 5000 })
  }
}

// 设置内容
const showSettingModal = ref(false)
function handleSettingSubmit() {
  if (!localStorage.getItem('SECRET_TOKEN')) {
    ms.info('请先登录~登录后每日有10000字符使用额度~', { duration: 5000 })
    return
  }
  showSettingModal.value = true
}

// 接受vscode的信息
window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message.type) {
    case "storeData":
      if (message.value) {
        chatStore.updateStore(JSON.parse(message.value))
        setLocalState(JSON.parse(message.value))
      } else {
        ss.remove('chatStorage')
        chatStore.updateStore(defaultState())
      }
      break;
    default:
      break;
  }
});


// 个人中心
function myHomeSubmit() {
  // chatStore.updateStore(JSON.parse())
  // return ;
  if (!localStorage.getItem('SECRET_TOKEN')) {
    ms.info('请先登录~登录后每日有10000字符使用额度~', { duration: 5000 })
    return
  }
  openModel()
  person.value.updated()
}

function modifyPassword() {
  tab.value = 'forget'
  showModal.value = true
}
// 登录注册功能
function showModelEvent() {
  tab.value = 'login'
  showModal.value = true
}
function handleSubmit() {
  showModal.value = false
  userStore.residueCountAPI()
  token.value = getToken()
}

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)

const personCenter = ref<any>({
  score: 0,
  notices: [],
  dataList: [],
  keyList: [],
  shops: [
    {
      title: '500万字符包',
      desc: '1元 = 5万字符',
      count: 30,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/500.png',
    },
    {
      title: '400万字符包',
      desc: '1元 = 3.7万字符',
      count: 30,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/400.png',
    },
    {
      title: '300万字符包',
      desc: '1元 = 3.3万字符',
      count: 30,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/300.png',
    },
    {
      title: '200万字符包',
      desc: '1元 = 3万字符',
      count: 30,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/200.png',
    },
    {
      title: '100万字符包',
      desc: '1元 = 2.8万字符',
      count: 7,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/100.png',
    },
    {
      title: '50万字符包',
      desc: '1元 = 2.5万字符',
      count: 50,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/50.png',
    },
    {
      title: '10万字符包',
      desc: '1元 = 2万字符',
      count: 10,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/10.png',
    },
    {
      title: '5美元key',
      desc: '回答速度很慢',
      count: 30,
      shopImg: 'https://chatmoss-shop-1253302184.cos.ap-beijing.myqcloud.com/shop/zh.png',
    },
  ],
})
const shopModal = ref(false)
const shopData = ref({}) as any
function buyEvent(item: any) {
  console.log('item', item)
  shopModal.value = true
  shopData.value = item
}

function setLocalState(arg0: any) {
throw new Error('Function not implemented.')
}
</script>

<template>
  <NLayoutSider :collapsed="collapsed" :collapsed-width="0" :width="200" :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform" position="absolute" bordered :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed">
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NButton id="question-btn" dashed block @click="handleAdd">
            新建问题
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <!-- 拓展功能区域 -->
        <div class="continuation">
          <div class="setting-main" @click="myHomeSubmit">
            <img class="setting-btn" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/icon2.png" alt="">
            <div class="setting-text">
              个人中心
            </div>
          </div>
          <div class="setting-main" @click="handleSettingSubmit">
            <img class="setting-btn" src="https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/v2.0/icon3.png" alt="">
            <div class="setting-text">
              ChatMoss商店
            </div>
          </div>
          <Tips @login="showModelEvent" />
        </div>
        <NModal v-model:show="showSettingModal" preset="dialog" style="width:80%;max-width: 600px; min-width: 350px;">
          <NCard title="ChatMoss商店" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <div>
              <div class="title-h1">
                字符包兑换码
              </div>
              <div class="flex">
                <NInput v-model:value="toMossCode" class="mr-2" type="text" placeholder="请输入您的字符包兑换码" />
                <NButton type="primary" ghost @click="toMossEvent">
                  确定
                </NButton>
              </div>
            </div>

            <NDivider />

            <div class="">
              <h1 class="title-h1">
                字符包商城
              </h1>
              <div class="tip-text-input1">
                小提示：OpenAI限制了5美元key的速度，字符包速度不受影响（字符包用的是120美金的key）
              </div>
              <div class="flex flex-wrap">
                <div v-for="(item, index) of personCenter.shops" :key="index" :class="{ 'border-div': index === 0 }"
                  class="item m-2 border-gray-50 border rounded-lg divide-solid text-center flex items-center justify-center flex-wrap flex-col cursor-pointer"
                  @click="buyEvent(item)">
                  <div class="title-h2">
                    {{ item.title }}
                  </div>
                  <div class="desc">
                    {{ item.desc }}
                  </div>
                </div>
              </div>
            </div>
            <NDivider />
          </NCard>
        </NModal>
        <!-- 购买字符数 -->
        <NModal v-model:show="shopModal">
          <NCard style="width: 400px" :title="shopData.title" size="huge" role="dialog" aria-modal="true"
            :mask-closable="true">
            <div class="tip-text-input2">
              支付宝扫码购买（暂不支持微信）
            </div>
            <img class="shop-img" :src="shopData.shopImg" alt="">
            <div class="tip-text-input3">
              您的支持就是我们的动力，我们会持续迭代本软件，提供更多更方便的功能！
            </div>
          </NCard>
        </NModal>
        <!-- 登录注册功能 -->
        <NModal v-model:show="showModal" transform-origin="center">
          <NCard style="width:80%;max-width: 600px;" title="" :bordered="false" size="huge" role="dialog"
            aria-modal="true">
            <Login :tab="tab" @loginSuccess="() => { handleSubmit() }" />
          </NCard>
        </NModal>
        <PersonCenter ref="person" @register="registerModal" @modify-password="modifyPassword" />
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
</template>

<style lang="less">
.continuation {
  margin-bottom: 20px;
  margin-top: 5px;
}

.setting-main {
  width: 90%;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px;
	border-radius: 6px;
	// background-color: #323232;
	margin: 0 auto;
	margin-bottom: 10px;
  &:active {
    transform: scale(.96);
  }
	&:hover {
		// background-color: #3c4250;
	}
  .setting-text {
    // color: rgba(232, 236, 239, 0.75);
    font-size: 10px;
  }

  .setting-btn {
    width: 20px;
    height: 20px;
    margin-left: 8px;
    margin-right: 12px;
  }
}

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

.n-card__content {}
</style>
