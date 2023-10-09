<script lang="ts" setup>
import { NPopover, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { Popover, Switch, Tooltip } from 'ant-design-vue'
import { useScroll } from './../../hooks/useScroll'
import { useAuthStoreWithout, useChatStore, useUserStore , useAppStore } from '@/store'
import { conversationUpload } from '@/api/index'
import { updateAppConfig } from '@/api/application'
import { useTheme } from '@/hooks/useTheme'
import { data } from './data'
const configs = ref(data)
const userStore = useUserStore()
const chatStore = useChatStore()
const ms = useMessage()
const popoverDom = ref()
const authStore = useAuthStoreWithout()
const appStore = useAppStore()
const { resetValue } = useScroll()
// router.replace({ name: 'chat', params: { uuid: chatStore.active } })
const { vantTheme } = useTheme()
const hidden = computed(() => {
  return location.search.includes('hiddenInput')
})

// 新建对话
function createQuestion() {
  chatStore.createChat()
  resetValue()
  ms.success('新建会话成功，请提问~')
}

// 历史记录
function toggleButtonEvent() {
  chatStore.chatList()
  appStore.setSiderCollapsed(true)
}

async function jarvisEvent() {
  ms.success('上传中，请稍等，大概5~20秒上传完成')
  const res = await conversationUpload({
    conversationId: chatStore.active,
  })
  ms.success(res.msg)
}

function setOpenaiVersion(action) {
  userStore.saveOpenaiVersion(action)
  popoverDom.value.setShow(false)
  ms.success('模型切换成功')
}

function handleMode() {
  userStore.toggleMode()
}
// const showPopover = ref(false)

// 当某个滑块被选中时，将其他滑块设为未选中状态
const handleSwitchChange = (selectedItem) => {
  chatStore.setPlugin(selectedItem)
  if (selectedItem.select) {
    chatStore.pluginList.forEach((item) => {
      if (item !== selectedItem)
        item.select = false
    })
  }
}
// 获取选中的插件信息
chatStore.getPlugin()
const dataSources = computed(() => chatStore.getChatByUuid())
function handleParamConfigs(item, row) {
  item.choiceSelect = row.id
  updateAppConfig({
    appId: userStore.appIdValue,
    choiceConfigList: userStore.currentApp.paramConfigs.map((row) => {
      return { paramName: row.name, choice: row.choiceSelect }
    }),
  })
}
</script>

<template>
  <div class="relative">
    <div v-if="dataSources.length === 0 && !userStore.isNotBootPrompt" style="
    z-index: 10;
    position: absolute;
		cursor: pointer;
    width: 162px;
    top: -124px;
    left: 50%;
    margin-left: -81px;" class="element-to-animate" @click="userStore.closeBootPrompt">
      <img v-if="vantTheme === 'dark'" src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/chat/drak-notice.png"
        alt="" style="width: 100%;">
      <img v-if="vantTheme === 'light'"
        src="https://codemoss-1253302184.cos.ap-beijing.myqcloud.com/chat/light-notice.png" alt="" style="width: 100%;">
    </div>

    <footer class="">
      <div v-if="userStore.currentApp && userStore.currentApp.paramConfigs" class="flex">
        <Popover class='my-popover' v-for="(item, ii) of userStore.currentApp.paramConfigs" title="" trigger="hover" ::key="ii"
          overlay-class-name="ant-popover-my">
          <template #content>
            <div class="text-center" style="padding: 8px;min-width: 100px">
              <div v-for="(row, i) of item.choices" :key="i"
                class="py-1 px-2 cursor-pointer hover:bg-[#00000040] rounded-lg" @click="handleParamConfigs(item, row)">
                {{ item.name }}:{{ row.value }}
              </div>
            </div>
          </template>
          <div style="background: #6388ff;"
            class="m-pointer footer-item footer-item-btn footer-item-btn1 flex-center btn-plugin ml-2">
            {{ item.name }}:{{ item.choicesMap[item.choiceSelect].value }}
          </div>
        </Popover>
      </div>

      <div class="footer-main">
        <div class="footer-left">
          <div class="div">
            <div class="div-wrap">
              <div v-if="!userStore.isQuestionMode"
                class="bg-[#EBEDF5] dark:bg-[#292929] btn !mr-[8px] flex items-center h-[29px] px-[9px] rounded-[13px]"
                @click="createQuestion">
                新建会话
              </div>
              <div v-if="!userStore.isQuestionMode" class="mr-[8px] hover:bg-[#edebf5] dark:hover:bg-[#292929] rounded-[6px]" @click="toggleButtonEvent"
                @mouseleave="() => { configs.search.active = false }"
                @mouseenter="() => { configs.search.active = true }">
                <Tooltip>
                  <template #title>历史记录</template>
                  <img v-show="!configs.search.active" :src="configs.search[vantTheme].img" class="w-[26px]" alt="">
                  <img v-show="configs.search.active" :src="configs.search[vantTheme].activeImg" class="w-[26px]" alt="">
                </Tooltip>

              </div>
              <Popover title="" trigger="hover" overlay-class-name="ant-popover-my" placement="topRight">
                <template #content>
                  <div style="padding: 8px">
                    <a href="https://chatmoss.feishu.cn/share/base/form/shrcngN778J03PwR7b8z7Puge0f" target="_blank">
                      <div class="plugin-btn">
                        <button type="primary">提交插件反馈</button>

                      </div>
                    </a>
                    <div v-for="(item, index) in chatStore.pluginList" :key="index" class="plugin-item">
                      <img class="plugin-item-icon" :src="item.icon" alt="">
                      <div class="plugin-item-info">
                        <div class="plugin-item-name">
                          {{ item.name }}
                        </div>
                        <div class="plugin-item-description">
                          {{ item.description }}
                        </div>
                      </div>
                      <Switch v-model:checked="item.select" @change="handleSwitchChange(item)" />
                    </div>
                    <div v-if="chatStore.pluginList.length === 0">
                      暂无插件
                    </div>
                  </div>
                </template>
                <div class="rounded-[6px] flex items-center hover:bg-[#edebf5] dark:hover:bg-[#292929]">
                  <div class="mr-[3px]" v-if="authStore.token" @mouseleave="() => { configs.plugin.active = false }"
                    @mouseenter="() => { configs.plugin.active = true }">
                    <img v-show="!configs.plugin.active" :src="configs.plugin[vantTheme].img" class="w-[26px]" alt="">
                    <img v-show="configs.plugin.active" :src="configs.plugin[vantTheme].activeImg" class="w-[26px]"
                      alt="">
                  </div>
                  <img v-if="chatStore.getSelectPluginInfo?.select" class="plugin-main-select-icon"
                    :src="chatStore.getSelectPluginInfo.icon" alt="">
                </div>
              </Popover>
              <!-- <div v-if="userStore.toggleValue && !userStore.isQuestionMode"
							class="footer-item footer-item-btn footer-item-btn2" @click="jarvisEvent">
							对话上传个人资料库
						</div> -->
            </div>
          </div>
        </div>
        <div class="footer-right">
          <div v-if="hidden"
            class="footer-item footer-item-btn footer-item-btn1 model-version dark:bg-[#6051FF] dark:text-[#FFFFFF] bg-[#6F22FE] text-[#fff]"
            @click="handleMode">
            {{ userStore.toggleValue ? '正常模式' : '极简模式' }}
          </div>
          <div class="footer-item">
            <div class="header-right-item header-right-item-help">
              <NPopover class="myPopover  dark:bg-[#ffffff]" ref="popoverDom" trigger="hover" placement="top" >
                <template #trigger>
                  <div v-if="userStore.getModeVersion"
                    class="model-version dark:bg-[#6051FF] dark:text-[#FFFFFF] bg-[#6F22FE] text-[#fff] flex items-center h-[29px] px-[9px] rounded-[13px] w-[114px]">
                    <img :src="userStore.getModeVersion.selectedIcon" class="w-[22px] h-[22px] mr-[4px]"  alt="">
                    <span>{{ userStore.getModeVersion.viewName }}</span>
                  </div>
                </template>
                <div>
                  <div v-for="(item, i) of userStore.getModelList" :key="i" class="model-item hover:text-[#BFBFBF] dark:hover:text-[#A7A9B2] text-[#1A1A1A] dark:text-[#FFFFFF]"
                    :class="[i < (userStore.getModelList.length - 1) ? 'line border-[#F6F7FA] dark:border-[#2D2D2E]' : '']" @click="setOpenaiVersion(item)">
                    <NPopover trigger="hover" placement="left" style="width: max-content;">
                      <div class="flex">
                        解释：{{ item.desc }}
                      </div>
                      <template #trigger>
                        <div class="cursor flex items-center h-[35px]">
                          <img :src="item.icon" class="w-[22px] h-[22px] mr-[8px]" alt="">
                          <span>{{ item.viewName }}</span>
                        </div>
                      </template>
                    </NPopover>
                  </div>
                </div>
              </NPopover>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.plugin-main-select-icon {
  width: 16px;
  height: 16px;
  margin-left: 6px;
}

.plugin-item {
  display: flex;
  align-items: center;
  width: 304px;
  height: 62px;
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;

  &:hover {
    background-color: #f2f3f5;
  }

  .plugin-item-icon {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  .plugin-item-info {
    // display: flex;
    width: 180px;
    height: 44px;
    margin-right: 10px;

    .plugin-item-name {
      width: 180px;
      height: 22px;
      margin-bottom: 4px;
      overflow: hidden;
      color: #1d2129;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .plugin-item-description {
      width: 180px;
      height: 17px;
      overflow: hidden;
      color: #86909c;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.model-item {
  padding: 3px 5px;
  cursor: pointer;
}

.line {
  border-bottom-width: 0.5px;
  border-bottom-style: solid;
}

.footer-main {
  width: 100%;
  min-width: 250px;
  // overflow: scroll;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  user-select: none;
  backdrop-filter: blur(20px);
  // background-color: var(--moss-bg-content-color);
  z-index: 20;

  .footer-left {
    width: 70%;
    display: flex;

    .div {
      display: block;
      overflow-x: auto;

      &::-webkit-scrollbar {
        width: 10px;
        height: 5px;
        /**/
      }

      &::-webkit-scrollbar-track {
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        border-radius: 10px;
      }

      .div-wrap {
        display: flex;
        align-items: center;
        width: max-content;

      }
    }
  }

  .footer-right {
    width: 30%;
    display: flex;
    justify-content: flex-end;
  }

  .footer-item {
    margin-right: 5px;
    cursor: pointer;
    display: inline-block;

    &:active {
      transform: scale(.96);
    }

    img {
      width: 20px;
      height: 20px;
    }
  }

  .footer-item-btn {
    // background: var(--moss-bg-btn-color);
    border-radius: 27px;
    // color: var(--moss-text-ask-color);
    padding: 2px 8px;
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 12px;

    &.model-version {
      // background-color: var(--moss-bg-ask-color);
    }
  }
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  z-index: 10000;
}

.wrapper-mian {
  width: 375px;
  height: 85vh;
  border-radius: 10px;
  transform: scale(0.95);

  iframe {
    width: 375px;
    height: 80vh;
  }
}

.plugin-btn {
  width: 284px;
  margin: 0 auto;
  margin-bottom: 20px;
  margin-top: 14px;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #000;
  padding: 10px 0px;
  cursor: pointer;
}
</style>
