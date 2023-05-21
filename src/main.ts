import { createApp } from 'vue'
import { NoticeBar, Overlay, Swipe, SwipeItem, Switch } from 'vant'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import 'vant/lib/index.css'
import getDomainAPI from './api/getDomain'
import VueTour from 'v3-tour'
import 'v3-tour/dist/vue-tour.css'

getDomainAPI().then(() => {
  bootstrap()
}).catch(() => {
  // console.log(error)
  bootstrap()
})

async function bootstrap() {
  const app = createApp(App)
  app.use(NoticeBar)
  app.use(Overlay)
  app.use(Swipe)
  app.use(SwipeItem)
  app.use(Switch)
  app.use(VueTour)
  setupAssets()

  await setupRouter(app)
  setupStore(app)

  setupI18n(app)

  app.mount('#app')
}
