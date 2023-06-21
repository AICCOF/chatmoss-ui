import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
import { PageLayout } from '@/views/page/layout'
import chat from '@/views/chat/index.vue'
import shop from '@/views/page/shop/index.vue'
// import login from '@/views/page/login/index.vue'
import Login from '@/views/page/login/login.vue'
import BindQQ from '@/views/page/login/bindqq.vue'
import BindWechat from '@/views/page/login/bindWechat.vue'
import register from '@/views/page/login/register.vue'
import forget from '@/views/page/login/forget.vue'
import setting from '@/views/page/setting/index.vue'
import application from '@/views/page/application/index.vue'
import invite from '@/views/page/invite/index.vue'
import help from '@/views/page/help/index.vue'
import sign from '@/views/page/sign/index.vue'
import feedback from '@/views/page/feedback/index.vue'
import appList from '@/views/page/appList/index.vue'
import createApp from '@/views/page/createApp/index.vue'
import c404 from '@/views/exception/404/index.vue'
import c500 from '@/views/exception/500/index.vue'
const routes: RouteRecordRaw[] = [
  {
    path: '/page',
    name: 'page',
    component: PageLayout,
    // redirect: '/page/shop',
    children: [
      {
        path: 'shop',
        name: 'shop',
        component: shop,
      },
      {
        path: 'login',
        name: 'login',
        component: Login,
      },
      {
        path: 'bindWechat',
        name: 'bindWechat',
        component: BindWechat,
      },
      {
        path: 'bindQQ',
        name: 'bindQQ',
        component: BindQQ,
      },
      {
        path: 'forget',
        name: 'forget',
        component: forget,
      },
      {
        path: 'register',
        name: 'register',
        component: register,
      },
      {
        path: 'setting',
        name: 'setting',
        component: setting,
      },
      {
        path: 'application',
        name: 'application',
        component: application,
      },
      {
        path: 'invite',
        name: 'invite',
        component: invite,
      },
      {
        path: 'sign',
        name: 'sign',
        component: sign,
      },
      {
        path: 'help',
        name: 'help',
        component: help,
      },
      {
        path: 'feedback',
        name: 'feedback',
        component: feedback,
      },
      {
        path: 'createApp',
        name: 'createApp',
        component: createApp,
      },
      {
        path: 'appList',
        name: 'appList',
        component: appList,
      },
    ],
  },
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    // redirect: '/chat',
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: chat,
      },
    ],
  },

  {
    path: '/404',
    name: '404',
    component: c404,
  },

  {
    path: '/500',
    name: '500',
    component: c500,
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
