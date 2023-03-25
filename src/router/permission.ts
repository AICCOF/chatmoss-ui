import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (from, to, next) => {
    const authStore = useAuthStoreWithout()

    if (from.path == '/') {
      next({ name: 'Chat' })
    }
    // if (from.path == '/login' && authStore.token){
    //   next({ name: 'Chat' })
    // }
    if (from.path !== '/login' && !authStore.token) {
      next()
      try {

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
