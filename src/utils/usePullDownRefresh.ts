import { ref, onMounted, onUnmounted } from 'vue';

export function usePullDownRefresh(element, callback) {
  const startY = ref(0);
  const distanceY = ref(0);
  const touchStart = (e) => {
    startY.value = e.touches[0].pageY;
  };
  const touchMove = (e) => {
    distanceY.value = e.touches[0].pageY - startY.value;
    if (distanceY.value > 100) {
      callback();
    }
  };
  onMounted(() => {
    console.log(element)
    element.value.addEventListener('touchstart', touchStart);
    element.value.addEventListener('touchmove', touchMove);
  });
  onUnmounted(() => {
    element.value.removeEventListener('touchstart', touchStart);
    element.value.removeEventListener('touchmove', touchMove);
  });
}

export function useScrollToBottom(element, callback) {

  const isScrolling = ref(false);
  const handleScroll = () => {
    console.log(222)
    if (!isScrolling.value && element.value.scrollTop + element.value.clientHeight >= element.value.scrollHeight) {
      isScrolling.value = true;
      callback().then(() => {
        isScrolling.value = false;
      });
    }
  };
  onMounted(() => {
    element.value && element.value.addEventListener('scroll', handleScroll);
  });
  onUnmounted(() => {
    element.value && element.value.removeEventListener('scroll', handleScroll);
  });
}
