import { onMounted, onUpdated, computed } from 'vue'
import { copyText } from '@/utils/format'
import {
  createDiscreteApi
} from 'naive-ui'
import { sendToMsg } from '@/utils/vsCodeUtils'
// const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
//   theme: themeRef.value === 'light' ? lightTheme : darkTheme
// }))

const { message } = createDiscreteApi(
  ['message'],
  {
    messageProviderProps:{max:1}
  }
)
let timer = null;
export function useCopyCode() {
  function copyCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      const copyBtn = wrapper.querySelector('.code-block-header__copy')
      const codeBlock = wrapper.querySelector('.code-block-body')
      const copyInsert = wrapper.querySelector('.code-block-header__insert')
      // console.log(copyBtn, codeBlock)
      if (copyBtn && codeBlock) {
        copyBtn.addEventListener('click', () => {

          if (navigator.clipboard?.writeText)
            navigator.clipboard.writeText(codeBlock.textContent ?? '')
          else
            copyText({ text: codeBlock.textContent ?? '', origin: true })
          message.success('已复制到剪切板')

          // clearTimeout(timer)
        })
      }

      if (copyBtn && copyInsert) {
        copyInsert.addEventListener('click', () => {
          sendToMsg('insertText', codeBlock.textContent) 
        })
      }

    })
  }

  onMounted(() => copyCodeBlock())

  onUpdated(() => copyCodeBlock())
}
