<script setup lang="ts">
import { ref, computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
// import { useGo } from '@/utils/router'
import { jumpLink } from '@/utils/jumpLink'
import { useRouter } from 'vue-router'
const { theme, themeOverrides, vantTheme } = useTheme()
const { language } = useLanguage()
let router = useRouter()
window.addEventListener("message", function (event) {
  // 可以检查 event.origin 以确保消息来自期望的源
  // console.log(event)
  if (typeof event.data === 'string') {
    let json = JSON.parse(event.data)
    jumpLink(json, router)
  }

}, false);
</script>

<template>
  <NConfigProvider class="h-full" :theme="theme" :theme-overrides="themeOverrides" :locale="language">
    <NaiveProvider>
      <van-config-provider :theme="vantTheme" class="h-full">
        <RouterView />

      </van-config-provider>
    </NaiveProvider>
  </NConfigProvider>
</template>
