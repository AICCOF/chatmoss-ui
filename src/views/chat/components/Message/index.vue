<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { NButton, useMessage } from 'naive-ui'
// import AvatarComponent from './Avatar.vue'
import { CaretRightOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { Collapse, CollapsePanel, Spin } from 'ant-design-vue'
import TextComponent from './Text.vue'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
// import { t } from '@/locales'
import { useChatStore } from '@/store'
import { getToken } from '@/store/modules/auth/helper'
// Spin
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const chatStore = useChatStore()
interface Props {
  dateTime?: number
  isShow: Boolean
  text?: string
  askMsg: any
  isEnd: Boolean
  inversion?: boolean
  error?: boolean
  loading?: boolean
  id?: number
  viewMsg?: string
  questionMode?: string
  info: Object
}
interface Emit {
  (ev: 'ask', askMsg: string): void
  (ev: 'online', askMsg: string): void
  (ev: 'jarvis', askMsg: string): void
  (ev: 'report', askMsg: Object): void
}
const { iconRender } = useIconRender()
const ms = useMessage()
const textRef = ref<HTMLElement>()

// console.error(props.isShow)
let options: any[] = [{
  label: '复制',
  key: 'copyText',
  icon: iconRender({ icon: 'ph:copy' }),
},
{
  label: '重新提问',
  key: 'ask',
  icon: iconRender({ icon: 'material-symbols:settings-backup-restore' }),
},
  // {
  //   label: '联网提问',
  //   key: 'online',
  //   icon: iconRender({ icon: 'heroicons-solid:status-online' }),
  // }
]
watch(
  () => props.info,
  (value) => {
    options = [
      {
        label: '复制',
        key: 'copyText',
        icon: iconRender({ icon: 'ph:copy' }),
      },

    ]
    if (!props.inversion && getToken()) {
      options.push({
        label: '重新提问',
        key: 'ask',
        icon: iconRender({ icon: 'material-symbols:settings-backup-restore' }),
      })
    }
    if (value.id) {
      options.push({
        label: '举报',
        key: 'report',
        icon: iconRender({ icon: 'octicon:report-16' }),
      })
    }
  },
  { immediate: true },
)

function handleSelect(key: string, askMsg: string) {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      ms.success('已复制到剪切板')
      break
    case 'ask':
      // console.log(props.info, askMsg)
      emit('ask', askMsg, props.info.id)
      break
    case 'online':
      emit('online', askMsg)
      break
    case 'jarvis':
      emit('jarvis', askMsg)
      break
    case 'report':
      emit('report', props.info)
      // reportCallback();
      break
    default:
      // 执行一些操作
      break
  }
}
const activeKey = ref(['0'])
const currentPage = ref(props.info.contentList ? props.info.contentList.length : 1)
const message = computed(() => {
  if (props.info && props.info.mossReduceInfoList) {
    if (props.info.mossReduceInfoList[currentPage.value - 1])
      return props.info.mossReduceInfoList[currentPage.value - 1].viewMsg
    else
      return null
  }
  return props.viewMsg
})
// console.log(props.info.mossReduceInfoList ,'Props.info1')
</script>

<template>
  <div class="flex w-full mb-4 overflow-hidden info" :class="[{ 'flex-row-reverse': inversion }]">
    <div :class="[inversion ? 'ml-2' : 'mr-2']">
      <!-- <AvatarComponent :image="inversion" /> -->
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dayjs(dateTime).format('MM月DD日 HH:mm') }} <span v-if="chatStore.active">会话ID:({{ chatStore.active }}) </span>
      </p>

      <Collapse
        v-if="!inversion && info.pluginInfo && info.pluginInfo.pluginId" v-model:activeKey="activeKey"
        :bordered="false" class="my-collapse" expand-icon-position="right"
      >
        <template #expandIcon="{ isActive }">
          <CaretRightOutlined :rotate="isActive ? 90 : 0" />
        </template>
        <CollapsePanel
          key="1" :show-arrow="info.pluginInfo && !!info.pluginInfo.pluginMessage"
          :collapsible="info.pluginInfo && !!info.pluginInfo.pluginMessage ? '' : 'disabled'"
        >
          <template #header>
            <div v-if="info.pluginInfo.pluginId" class="flex-center" style="width: 100%">
              <img
                style="width: 16px; height: 16px; margin-right: 10px;"
                :src="chatStore.pluginMap[info.pluginInfo.pluginId].icon" alt=""
              >
              <div>
                {{
                  info.pluginInfo.pluginId
                    ? chatStore.pluginMap[info.pluginInfo.pluginId].name
                    : ''
                }}
              </div>
              <div v-if="chatStore.plugState === 1 && isEnd">
                <span class="plug-in-loading" style="margin-right: 10px; margin-left: 4px;">
                  {{ info.pluginInfo.pluginMessage ? ' 解析数据中...' : ' 请求数据中...' }}
                </span>
                <Spin :spinning="true" size="small" />
              </div>
            </div>
          </template>
          <p>{{ info.pluginInfo.pluginMessage }}</p>
        </CollapsePanel>
      </Collapse>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent
          ref="textRef" v-model="currentPage" :inversion="inversion" :error="error" :text="text"
          :info="props.info" :loading="loading"
        />
      </div>
      <p v-if="!inversion && message" class="text-xs mt-1 btns" :class="[inversion ? 'text-right' : 'text-left']">
        <span>{{ message }} </span>
        <span>(模式：{{ questionMode }}) </span>
        <a
          href="https://tiktoken.aigc2d.com/" style="margin-left: 10px; color: var(--moss-text-blue-color);"
          target="_blank"
        >查看字符计算器</a>
      </p>
      <div class="flex mt-2 ml-2 btns btns1" :class="[inversion ? 'justify-end' : 'justify-start']">
        <div v-for="(option, i) in options" :key="i" class="mr-3" text>
          <NButton class="btn" text @click="handleSelect(option.key, askMsg || text)">
            <component :is="option.icon" />
            <span class="ml-1">{{ option.label }}</span>
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.text-xs {
  color: var(--moss-text-time-color)
}

.info {
  // padding: 0 48px;
  // padding-right: 114px;
  // transition: 1s all;
  // color: #86909c;

	.btns1 {
		padding-top: 0px !important;
    padding-left: 0px !important;
	}

  .btns {
    transition: 0.5s all;
    opacity: 0;
  }

  &:hover {
    .btns {
      opacity: 1;
    }
  }
}
</style>

<style lang="less">
.ant-collapse-borderless {
  background-color: #fff0 !important;

  .ant-collapse-header {
    color: var(--moss-text) !important;
    background: var(--moss-tip-bg-color);
    border-radius: 10px !important;
    margin-top: 12px;
    opacity: 1;
  }
}

.ant-collapse-item {
  border: none !important;
}

.ant-collapse-content-box {
  background-color: #000;
  color: #fff;
  padding-top: 16px !important;
}
</style>
