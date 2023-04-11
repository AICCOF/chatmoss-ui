import type { ConfigEnv, ProxyOptions } from 'vite'

export function createViteProxy(env:ConfigEnv,viteEnv: ImportMetaEnv) {
  if (env.mode !== 'development') return
   
  const proxy: Record<string, string | ProxyOptions> = {
    '/luomacode-api': {
      target: viteEnv.VITE_APP_API_BASE_URL,
      changeOrigin: true, // 允许跨域
      rewrite: path => path.replace('/luomacode-api/', '/luomacode-api/'),
    },
    '/api': {
      target: 'http://chatmoss.aihao123.cn',
      changeOrigin: true, // 允许跨域
      rewrite: path => path.replace('api/', 'api/'),
    },
  }

  return proxy
}



 

