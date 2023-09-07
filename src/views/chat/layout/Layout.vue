<script setup lang='ts'>
import { computed } from 'vue'
import { NLayout, NLayoutContent } from 'naive-ui'
// import { useRouter } from 'vue-router'
import Sider from './sider/index.vue'
import Header from './header/index.vue'

import Permission from './Permission.vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAuthStore, useChatStore } from '@/store'
// const router = useRouter()
// const appStore = useAppStore()
// const chatStore = useChatStore()
const authStore = useAuthStore()
// router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

const { isMobile } = useBasicLayout()

// const collapsed = computed(() => appStore.siderCollapsed)


const getMobileClass = computed(() => {
  return ['rounded-none', 'shadow-none']
  // return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})

const getContainerClass = computed(() => {
  return [
    'h-full',
  ]
})



</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all" :class="[isMobile ? 'p-0' : 'p-0']">
    <div class="h-full overflow-hidden" :class="getMobileClass">
      <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
        <!-- 历史记录 -->
        <Sider/>
        <!-- 头部 -->
        <Header />
        <NLayoutContent class="h-full">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </NLayoutContent>
      </NLayout>
    </div>
  </div>
</template>
