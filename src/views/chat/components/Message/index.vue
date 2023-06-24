<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NButton, useMessage } from 'naive-ui'
// import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { useChatStore } from '@/store'
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const chatStore = useChatStore()
interface Props {
  dateTime?: string
  isShow: Boolean
  text?: string
  askMsg: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  id?: number
  viewMsg?: string
  questionMode?: string;
}
interface Emit {
  (ev: 'ask', askMsg: string): void
  (ev: 'online', askMsg: string): void
  (ev: 'jarvis', askMsg: string): void
}

const { iconRender } = useIconRender()
const ms = useMessage()
const textRef = ref<HTMLElement>()

// console.error(props.isShow)
let options: any[] = []
watch(() => props.isShow, (value) => {
  options = value
    ? [
      {
        label: t('复制'),
        key: 'copyText',
        icon: iconRender({ icon: 'ph:copy' }),
      },
      {
        label: t('重新提问'),
        key: 'ask',
        icon: iconRender({ icon: 'material-symbols:settings-backup-restore' }),
      },
      {
        label: t('联网提问'),
        key: 'online',
        icon: iconRender({ icon: 'heroicons-solid:status-online' }),
      },
      {
        label: t('个人资料库提问'),
        key: 'jarvis',
        icon: iconRender({ icon: 'icon-park-solid:brain' }),
      },
    ]
    : []
}, { immediate: true })

function handleSelect(key: string, askMsg: string) {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      ms.success('已复制到剪切板')
      return
    case 'ask':
      emit('ask', askMsg)
      //   domtoimage.toPng(document.getElementById('data-wrapper')).then(function (screenshot) {
      //   // 创建一个新的窗口或标签页来显示截图结果
      //   console.log(screenshot)
      // }).catch(function (error) {
      //   console.error('截图失败:', error);
      // });
      return
    case 'online':
      emit('online', askMsg)
      return
    case 'jarvis':
      emit('jarvis', askMsg)
  }
}
</script>

<template>
  <div class="flex w-full mb-4 overflow-hidden" :class="[{ 'flex-row-reverse': inversion }]">
    <div :class="[inversion ? 'ml-2' : 'mr-2']">
      <!-- <AvatarComponent :image="inversion" /> -->
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }} <span v-if="chatStore.active">({{ chatStore.active }}) </span>
      </p>
      <p class="text-xs mt-1" :class="[inversion ? 'text-right' : 'text-left']" v-if="!inversion && viewMsg">
        <span>提问消耗：{{ viewMsg }} </span>
        <span>(模式：{{ questionMode }}) </span>
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading"
          @copy="handleSelect('copyText', '')" />
      </div>
      <div v-if="!inversion" class="flex mt-2 ml-2">
        <div v-for="(option, i) in options" :key="i" class="mr-3" text>
          <NButton text @click="handleSelect(option.key, askMsg)">
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
</style>
