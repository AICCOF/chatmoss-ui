
<script setup lang='ts'>
import { NModal, NCarousel, NCarouselItem } from 'naive-ui'
import { ref, watch, defineProps, defineEmits } from 'vue'
import { getToken } from '@/store/modules/auth/helper'
import { useUserStore } from '@/store'
const userStore = useUserStore()
let showModal = ref(false)
const props = defineProps<Props>()
interface Props {
  modelValue: boolean
}
// let list = ref(userStore.activities)

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
function lockUrl(row: any) {
  let url = new URL(row.url);
  url.searchParams.set('token', getToken())
  ifFrame.value = {
    isShow: true,
    url: url.toString()
  }
}

</script>

<template>
  <NModal v-model:show="showModal" @afterLeave="onAfterLeave">
    <div class="flex justify-center" style="width:100vw;height: 400px;">
      <n-carousel centered-slides effect="card" prev-slide-style="transform:translateX(-168%) translateZ(-200px); opacity:1"
        next-slide-style="opacity: 1; transform: translateX(68%) translateZ(-200px);" :loop="false" draggable>

        <n-carousel-item :style="{ width: '80%' }" v-for="(row, i) of userStore.activities" :key="i">
          <img class="carousel-img m-auto" :src="row.img" @click="lockUrl(row)">

        </n-carousel-item>

        <template #dots="{ total, currentIndex, to }">
          <div class="custom-wrap">
            <ul class="custom-dots">
              <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                @click="to(index - 1)" />
            </ul>
          </div>
        </template>
      </n-carousel>
    </div>

  </NModal>
  <NModal v-model:show="ifFrame.isShow">
    <iframe :src="ifFrame.url" frameborder="0" style="width:80vw;height:80vh"></iframe>
  </NModal>
</template>

<style>
.carousel-img {
  margin: 0 auto;
  width: 100%;
  height: 100%;
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