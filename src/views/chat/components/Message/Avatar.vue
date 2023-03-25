<script lang="ts" setup>
import { NAvatar } from 'naive-ui'

interface Props {
  image?: boolean
}
defineProps<Props>()
</script>

<template>
  <NAvatar round :src="image ? 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/avatar1.png' : 'https://luomacode-1253302184.cos.ap-beijing.myqcloud.com/logo.svg'" />
</template>
