<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import hljs from 'highlight.js'
import * as IncrementalDOM from 'incremental-dom'
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { isVscode } from '@/utils/vsCodeUtils'
import { SvgIcon } from '@/components/common'

import { jumpLink } from '@/utils/jumpLink'
import { useRouter } from 'vue-router'
interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  info: any
  loading?: boolean
  modelValue: Number
}
interface Emit {
  (e: 'copy'): void
  (e: 'update:modelValue'): void
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
mdi.use(MarkdownItIncrementalDOM, IncrementalDOM)
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
const textInfo = ref('')
// let currentPage = ref(1)
function handleChange(page) {
  // console.log(page)
  textInfo.value = props.info.contentList[page - 1]
  emit('update:modelValue', page)
}

onMounted(() => {
  watch(() => props.info, () => {
    if (props.info && props.info.contentList && !props.info.contentList[props.info.contentList.length - 1]) {
      currentPage.value = props.info.contentList.length
      emit('update:modelValue', currentPage.value)
    }

    if (props.info && props.info.contentList && props.info.contentList[props.info.contentList.length - 1])

      textInfo.value = props.info.contentList[props.info.contentList.length - 1]
  }, { immediate: true, deep: true })

  watch(() => props.text, () => {
    // textInfo.value = props.text;
  }, { immediate: true })

  watch(() => textInfo.value, () => {
    const dom = textRef.value?.querySelector('.markdown-body')
    // console.log(textInfo, dom)
    if (dom) {
      IncrementalDOM.patch(
        dom,
        mdi.renderToIncrementalDOM(!props.info.contentList ? props.info.text : textInfo.value),
      )
    }
  }, { immediate: true })
})

const text = computed(() => {
  const value = props.text ?? ''
  // console.log(mdi.render(value).split('\n'))
  if (!props.inversion)
    return mdi.render(value)
  return value
})

const handleDoubleClick = () => {
  emit('copy')
}

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper flex"><div style='width:100%'>
        <div class="code-block-header"><span class="code-block-header__lang">${lang}</span><div class='flex'>${isVscode() ? '<span class="code-block-header__insert mr-2">插入代码</span>' : ''}<span class="code-block-header__copy">${t('chat.copyCode')}</span></div></div><code class="hljs code-block-body ${lang}">${str}</code></div></pre>`
}
// console.log(props, 'props.value')
let currentPage = ref(props.modelValue)
defineExpose({ textRef })

// 登录后才可使用
const loginMessage = computed(() => {
  let message = ['登录后才可使用', '您好，因为服务器成本问题，本软件已经暂停未登录用户使用自己的Key', '试用字符已经用尽，扫码登录后']
  for (let i = 0; i < message.length; i++) {
    const element = message[i];
    if (props.text && props.text.indexOf(element) > -1) {
      return true;
    }
  }
  return false
})

const shopMessage = computed(() => {
  let message = ['当前余额模型不足', '您可以先去左上角商城内购买']
  for (let i = 0; i < message.length; i++) {
    const element = message[i];
    if (props.text && props.text.indexOf(element) > -1) {
      return true;
    }
  }
  return false
})
const router = useRouter()
function handleLogin() {

  jumpLink({ type: 'path', info: { path: 'login' } }, router)
}
function handleShop() {

  jumpLink({ type: 'path', info: { path: 'shop' } }, router)
}
</script>

<template>
  <div class="" :class="wrapClass">
    <template v-if="loading">
      <!-- <img src="@/assets/icon/icon-loading.png" class="loading" /> -->
      <!-- nonicons:loading-16 -->
      <SvgIcon icon="nonicons:loading-16" class="loading" style="color:#6388FF" />
    </template>
    <!-- 普通提问展示 -->
    <div v-show="!loading">
      <div ref="textRef" class="leading-relaxed break-words" @dblclick="handleDoubleClick">
        <div v-if="!inversion" class="markdown-body" />
        <div v-else class="whitespace-pre-wrap" v-text="text" />
      </div>
      <div class="golink" v-if="!inversion && loginMessage" @click="handleLogin">去登录</div>
      <div class="golink" v-if="!inversion && shopMessage" @click="handleShop">去购买</div>
    </div>
    <!-- 重新提问展示 -->
    <div v-if="!inversion && info.contentList && info.contentList.length > 1" style="width: 100px;">
      <van-pagination v-model="currentPage" :show-prev-button="false" :page-count="info.contentList.length" mode="simple"
        class="my-pagination" @change="handleChange">
        <template #prev-text>
          <van-icon name="arrow-left" />
        </template>
        <template #next-text>
          <van-icon name="arrow" />
        </template>
      </van-pagination>
    </div>
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

.golink {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 57px;
  height: 27px;
  border-radius: 13px;
  border: 1px solid #5C86F5;
  font-size: 11px;
  font-weight: 400;
  color: #5C86F5;
  line-height: 15px;
}
</style>
