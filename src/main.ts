import { createApp } from 'vue'

import 'vant/lib/index.css'
import 'v3-tour/dist/vue-tour.css'
import '@vant/touch-emulator';

import { NavBar, ConfigProvider, Tab, Tabs, Cell, CellGroup, Button, Field, Icon, Search, Sidebar, SidebarItem, Image as VanImage, Popup, ActionSheet, Divider, DropdownMenu, DropdownItem, Popover, Checkbox, CheckboxGroup, RadioGroup, Radio, Pagination, Badge } from 'vant';
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import '@/styles/iconfont.css'


import getDomainAPI from './api/getDomain'
import VueTour from 'v3-tour'
import 'ant-design-vue/dist/antd.css';

import { NoticeBar, Overlay, Swipe, SwipeItem, Switch, Tabbar, TabbarItem } from 'vant'

// bootstrap()
getDomainAPI().then(() => {
  bootstrap()
}).catch(() => {
  // console.log(error)
  bootstrap()
})

async function bootstrap() {
  const app = createApp(App)
  app.use(Badge);
  app.use(Pagination);
  app.use(ActionSheet);
  app.use(NoticeBar)
  app.use(Overlay)
  app.use(Swipe)
  app.use(SwipeItem)
  app.use(Switch)
  app.use(NavBar)
  app.use(VueTour)
  app.use(ConfigProvider);
  app.use(Tab);
  app.use(Tabs);
  app.use(Cell);
  app.use(CellGroup);
  app.use(Button);
  app.use(Field);
  app.use(Icon);
  app.use(Search);
  app.use(Sidebar);
  app.use(SidebarItem);
  app.use(VanImage);
  app.use(Popup);
  app.use(Divider);
  app.use(DropdownMenu);
  app.use(DropdownItem);
  app.use(Popover);
  app.use(Checkbox);
  app.use(CheckboxGroup);
  app.use(Radio);
  app.use(RadioGroup);
  app.use(Tabbar);
  app.use(TabbarItem);

  setupAssets()

  await setupRouter(app)
  setupStore(app)

  setupI18n(app)

  app.mount('#app')
}
