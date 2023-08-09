<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NButton, useMessage } from 'naive-ui'
// import AvatarComponent from './Avatar.vue'
import dayjs from 'dayjs'
import TextComponent from './Text.vue'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
// import { t } from '@/locales'
import { useChatStore } from '@/store'
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const chatStore = useChatStore()
interface Props {
  dateTime?: number
  isShow: Boolean
  text?: string
  askMsg: string
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
{
  label: '联网提问',
  key: 'online',
  icon: iconRender({ icon: 'heroicons-solid:status-online' }),
}]
watch(
  () => props.info,
  (value) => {
    options = [
      {
        label: '复制',
        key: 'copyText',
        icon: iconRender({ icon: 'ph:copy' }),
      },
      {
        label: '重新提问',
        key: 'ask',
        icon: iconRender({ icon: 'material-symbols:settings-backup-restore' }),
      },
      {
        label: '联网提问',
        key: 'online',
        icon: iconRender({ icon: 'heroicons-solid:status-online' }),
      },

      // {
      //   label: t('个人资料库提问'),
      //   key: 'jarvis',
      //   icon: iconRender({ icon: 'icon-park-solid:brain' }),
      // },
    ]
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
      emit('ask', askMsg)
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
      <p v-if="!inversion && viewMsg" class="text-xs mt-1" :class="[inversion ? 'text-right' : 'text-left']">
        <span>{{ viewMsg }} </span>
        <span>(模式：{{ questionMode }}) </span>
        <a
          href="https://tiktoken.aigc2d.com/" style="margin-left: 10px; color: var(--moss-text-blue-color);"
          target="_blank"
        >查看字符计算器</a>
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading" />
      </div>
      <div class="flex mt-2 ml-2 btns">
        <div v-for="(option, i) in options" :key="i" class="mr-3" text>
          <NButton class="btn" text @click="handleSelect(option.key, askMsg)">
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
