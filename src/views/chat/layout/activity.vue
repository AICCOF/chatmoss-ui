<script setup lang='ts'>
import { NCarousel, NCarouselItem, NModal } from 'naive-ui'
import { defineEmits, defineProps, ref, watch } from 'vue'
import { getToken } from '@/store/modules/auth/helper'
import { useUserStore } from '@/store'
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const userStore = useUserStore()
const showModal = ref(false)
interface Props {
  modelValue: boolean
}
// let list = ref(userStore.activities)

const ifFrame = ref({
  isShow: false,
  url: '',
})
watch(
  () => props.modelValue,
  (value) => {
    showModal.value = value
    // console.error(value)
    //  emit('update:modelValue', value)
  },
  { immediate: true },
)

interface Emit {
  (e: 'update:modelValue', value: Boolean): void
}
function onAfterLeave() {
  emit('update:modelValue', false)
}
function lockUrl(row: any) {
  const url = new URL(row.url)
  row.isSelf && url.searchParams.set('token', getToken())
  url.searchParams.set('time', `${new Date().getTime()}`)
  ifFrame.value = {
    isShow: true,
    url: url.toString(),
  }
  onAfterLeave()
}
</script>

<template>
  <NModal v-model:show="showModal" @afterLeave="onAfterLeave">
    <div class="flex justify-center" style="width:100vw;height: 400px;">
      <NCarousel
        centered-slides effect="card" prev-slide-style="transform:translateX(-168%) translateZ(-200px); opacity:1"
        next-slide-style="opacity: 1; transform: translateX(68%) translateZ(-200px);" :loop="false" draggable
      >
        <NCarouselItem v-for="(row, i) of userStore.activities" :key="i" :style="{ width: '375px' }">
          <img class="carousel-img m-auto" :src="row.img" @click="lockUrl(row)">
        </NCarouselItem>

        <template #dots="{ total, currentIndex, to }">
          <div class="custom-wrap">
            <ul class="custom-dots">
              <li
                v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                @click="to(index - 1)"
              />
            </ul>
          </div>
        </template>
      </NCarousel>
    </div>
  </NModal>
  <NModal v-model:show="ifFrame.isShow">
    <iframe :src="ifFrame.url" frameborder="0" style="width:375px;height:80vh;transform: scale(0.95);" />
  </NModal>
</template>

<style>
.carousel-img {
  margin: 0 auto;
  width: 300px;
  height: 400px;
  object-fit: cover;
}

.custom-wrap {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  /* left: 20px; */
  width: 100%;
}

.custom-dots {
  margin: 0 auto;
}

.custom-dots li {
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 3px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  transition: width 0.3s, background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-dots li.is-active {
  width: 10px;
  background: #fff;
}
</style>
