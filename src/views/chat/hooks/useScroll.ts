import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'

type ScrollElement = HTMLDivElement | null

interface ScrollReturn {
  scrollRef: Ref<ScrollElement>
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  goToBottom: () => Promise<void>
}

export function useScroll(): ScrollReturn {
  const scrollRef = ref<ScrollElement>(null)
  const isBottom = ref(false)
  // console.log(scrollRef.value)
  watch(() => scrollRef.value, (...args) => {
    if (scrollRef.value) {
      scrollRef.value.addEventListener('scroll', async () => {
        if (scrollRef.value.scrollHeight - 10 < (scrollRef.value.scrollTop + scrollRef.value.clientHeight)) {
          //到达底了
          isBottom.value = true;
        }else{
          isBottom.value = false;
        }
      })
    }
  })


  const scrollToBottom = async () => {
    // console.log(isBottom.value)
    await nextTick()
    if (scrollRef.value && isBottom.value)
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
  const goToBottom = async () => {
    isBottom.value = true;
    if (scrollRef.value)
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }

  const scrollToTop = async () => {
    await nextTick()
    if (scrollRef.value)
      scrollRef.value.scrollTop = 0
  }

  return {
    scrollRef,
    scrollToBottom,
    scrollToTop,
    goToBottom
  }
}
