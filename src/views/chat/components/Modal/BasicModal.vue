<script setup lang="ts">
import {  NModal  } from 'naive-ui'
import { ref } from 'vue';

let emits = defineEmits(['register'])
let showModal = ref(false)

function openModel() {
  showModal.value = true
}
function closeModel() {
  showModal.value = false
}

emits('register',{openModel,closeModel})

</script>

<template>
 
 <NModal v-model:show="showModal" transform-origin="center">
      <slot />
      <slot name='footer'/>
 </NModal>

</template>