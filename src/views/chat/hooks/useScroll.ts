import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'

type ScrollElement = HTMLDivElement | null

interface ScrollReturn {
  scrollRef: Ref<ScrollElement>
  isBottom: Ref<boolean>
  isTop: Ref<boolean>
  isEnd: Ref<boolean>
  resetValue: () => void
  scrollToBottom: () => Promise<void>
  scrollToTop: () => Promise<void>
  goToBottom: () => Promise<void>
}

export function useScroll(): ScrollReturn {
  const scrollRef = ref<ScrollElement>(null)
  const isBottom = ref(false)
  const isTop = ref(false)
  const isEnd = ref(false)
  // console.log(scrollRef.value)
  watch(() => scrollRef.value, (...args) => {
    if (scrollRef.value) {
      scrollRef.value.addEventListener('scroll', async () => {
        // console.log(scrollRef.value.scrollHeight , scrollRef.value.clientHeight)
        if (scrollRef.value.scrollHeight <= scrollRef.value.clientHeight){
          isTop.value = false;
          isEnd.value = false;
          return ;
        }
        if (scrollRef.value.scrollTop < 20) {
          isTop.value = true;
        } else {
          isTop.value = false;
        }
        if (scrollRef.value.scrollHeight - 10 < (scrollRef.value.scrollTop + scrollRef.value.clientHeight)) {
          //到达底了
          isBottom.value = true;
          isEnd.value = true;
        } else {
          isBottom.value = false;
          isEnd.value = false;
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
  const resetValue = () => {
    // isTop.value = false;
    // isEnd.value = false

    // console.log(isTop, isEnd)
  }

  return {
    isBottom,
    isTop,
    resetValue,
    isEnd,
    scrollRef,
    scrollToBottom,
    scrollToTop,
    goToBottom
  }
}
