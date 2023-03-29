import type { App } from 'vue'
import { store } from './store'

export * from './store'

export function setupStore(app: App) {
  app.use(store)
}
export * from './modules'
