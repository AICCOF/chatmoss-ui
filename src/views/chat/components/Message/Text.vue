<script lang="ts" setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import hljs from 'highlight.js'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { isVscode } from '@/utils/vsCodeUtils'
interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
}
interface Emit {
  (e: 'copy'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const textRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(lang, code, true).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'p-3',
    props.inversion ? 'text-right' : 'text-left',
    { 'text-red-500': props.error },
  ]
})

const text = computed(() => {
  const value = props.text ?? ''
  if (!props.inversion)
    return mdi.render(value)
  return value
})

const handleDoubleClick = () => {
  emit('copy')
}

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper">
    <div class="code-block-header">
      <span class="code-block-header__lang">${lang}</span>
      <div class='flex'>${isVscode()?'<span class="code-block-header__insert mr-2">插入代码</span>':''}<span class="code-block-header__copy">${t('chat.copyCode')}</span></div></div><code class="hljs code-block-body ${lang}">${str}</code>
    </pre>`
}

defineExpose({ textRef })
</script>

<template>
  <div class="" :class="wrapClass">
    <template v-if="loading">
        <img src="@/assets/icon/icon-loading2.png" class="loading" />
    </template>
    <template v-if="!loading">
      <div ref="textRef" class="leading-relaxed break-words" @dblclick="handleDoubleClick">
        <div v-if="!inversion" class="markdown-body" v-html="text" />
        <div v-else class="whitespace-pre-wrap" v-text="text" />
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
@import url(./style.less);

.text-left {
  background-color: var(--moss-bg-reply-color);
  color: var(--moss-text-reply-color);
}

.text-right {
  background-color: var(--moss-bg-ask-color);
  color: var(--moss-text-ask-color);
  text-align: left;
}
</style>
