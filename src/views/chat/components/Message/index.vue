<script setup lang='ts'>
import { ref, watch } from 'vue'
import { NDropdown, useMessage, NButton } from 'naive-ui'
// import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { useChatStore } from '@/store'
const chatStore = useChatStore()
interface Props {
  dateTime?: string
  isShow: Boolean;
  text?: string
  askMsg: string;
  inversion?: boolean
  error?: boolean
  loading?: boolean
  id?: number;
}
const emit = defineEmits<Emit>()
interface Emit {
  (ev: 'ask', askMsg: string): void
  (ev: 'online', askMsg: string): void
}


const props = defineProps<Props>()

const Message = useMessage()

const { iconRender } = useIconRender()

const textRef = ref<HTMLElement>()

// console.error(props.isShow)
let options: any[] = [];
watch(() => props.isShow, (value) => {
  options = value ? [
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
  ] : []

}, { immediate: true })


function handleSelect(key: string, askMsg: string) {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      Message.success('已复制到剪切板')
      return;
    case 'ask':
      emit('ask', askMsg)
      return;
    case 'online':
      emit('online', askMsg)
      return;

  }
}
</script>

<template>
  <div class="flex w-full mb-6 overflow-hidden" :class="[{ 'flex-row-reverse': inversion }]">
    <div :class="[inversion ? 'ml-2' : 'mr-2']">
      <!-- <AvatarComponent :image="inversion" /> -->
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
     {{ dateTime }}  <span v-if="chatStore.active">({{ chatStore.active }})  </span>
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading"
          @copy="handleSelect('copyText', '')" />

      </div>
      <div class="flex mt-2 ml-2" v-if="!inversion">
        <div class="mr-3" v-for="(option, i) in options" text :key="i">
          <NButton text @click="handleSelect(option.key, askMsg)">
            <component :is="option.icon"></component>
            <span class="ml-1">{{ option.label }}</span>
          </NButton>

        </div>

      </div>
    </div>
  </div>
</template>
