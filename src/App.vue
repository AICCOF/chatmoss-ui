<script setup lang="ts">
import { ref, computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { useGo } from '@/utils/router'
const go = useGo()
const { theme, themeOverrides, vantTheme } = useTheme()
const { language } = useLanguage()
import { getToken } from '@/store/modules/auth/helper'
window.addEventListener("message", function (event) {
  // 可以检查 event.origin 以确保消息来自期望的源
  // console.log(event)
  if (typeof event.data === 'string') {
    let json = JSON.parse(event.data)
    if (json.type === 'path') {
      go({
        name: json.info.path
      })
    } else if (json.type === 'web') {
      if (json.info.type === 'openLink') {
        // win
        let dom = json.info.url
        if (location.origin == 'http://localhost') {
           dom = dom.replace('http://h5.aihao123.cn', 'http://127.0.0.1:5173')
        }

        let url = `${dom}?token=${getToken()}&time=${new Date().getTime()}`
        window.open(url)
      } else {
        go({
          name: 'h5',
          query: json.info
        })
      }
    }
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
