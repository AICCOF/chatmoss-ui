import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (from, to, next) => {
    const authStore = useAuthStoreWithout()

    if (from.path === '/')
      next({ name: 'chat' })

    // if (from.path == '/login' && authStore.token){
    // }
    if (from.path !== '/login' && !authStore.token) {
      next()
      try {
        // 等待内容填充
      }
      catch (error) {
        if (from.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
