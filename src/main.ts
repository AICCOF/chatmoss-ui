import { createApp } from 'vue'
import { NoticeBar, Swipe, SwipeItem, Switch } from 'vant'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import 'vant/lib/index.css'

async function bootstrap() {
  const app = createApp(App)
  app.use(NoticeBar)
  app.use(Swipe)
  app.use(SwipeItem)
  app.use(Switch)
  setupAssets()

  await setupRouter(app)
  setupStore(app)

  setupI18n(app)

  app.mount('#app')
}

bootstrap()
