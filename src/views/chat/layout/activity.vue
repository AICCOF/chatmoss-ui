
<script setup lang='ts'>
import { NModal, NCarousel } from 'naive-ui'
import { ref, watch, defineProps, defineEmits } from 'vue'
import { getToken } from '@/store/modules/auth/helper'
let showModal = ref(false)
const props = defineProps<Props>()
interface Props {
  modelValue: boolean
}
let list = ref([
  {
    img: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg',
    url: 'https://windicss.org/utilities/layout/spacing.html#margin'
  },
  {
    img: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg',
    url: 'https://www.baidu.com'
  },
  {
    img: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg',
    url: 'https://www.baidu.com'
  },
  {
    img: 'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg',
    url: 'https://www.baidu.com'
  }

])

let ifFrame = ref({
  isShow: false,
  url: ''
});
watch(
  () => props.modelValue,
  (value) => {
    showModal.value = value;
    // console.error(value)
    //  emit('update:modelValue', value)
  },
  { immediate: true },
)


const emit = defineEmits<Emit>()
interface Emit {
  (e: 'update:modelValue', value: Boolean): void
}
function onAfterLeave() {
  emit('update:modelValue', false)
}
function lockUrl(row) {
  let url = new URL(row.url);
  url.searchParams.set('token', getToken())
  ifFrame.value = {
    isShow: true,
    url: url.toString()
  }
}

</script>

<template>
  <NModal v-model:show="showModal" preset="card" @afterLeave="onAfterLeave">
    <div class="flex justify-center">
      <n-carousel autoplay centered-slides>
        <img v-for="(row, i) of list" :key="i" class="carousel-img m-auto" :src="row.img" @click="lockUrl(row)">
      </n-carousel>
    </div>
  </NModal>
  <NModal v-model:show="ifFrame.isShow" @afterLeave="onAfterLeave">
    <iframe :src="ifFrame.url" frameborder="0" style="width:80vw;height:80vh"></iframe>
  </NModal>
</template>
