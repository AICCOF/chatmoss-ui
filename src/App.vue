<script setup lang="ts">
import { ref, computed } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'

const { theme, themeOverrides, vantTheme } = useTheme()
const { language } = useLanguage()

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
