<script setup lang="ts">
import { NModal } from 'naive-ui'
import { onMounted, ref } from 'vue'

const emits = defineEmits(['register'])
const showModal = ref(false)

function openModel() {
  showModal.value = true
}
function closeModel() {
  showModal.value = false
}
onMounted(() => {
  emits('register', { openModel, closeModel })
})
</script>

<template>
  <NModal v-model:show="showModal" transform-origin="center">
    <slot />
    <slot name="footer" />
  </NModal>
</template>
