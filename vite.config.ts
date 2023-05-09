import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createViteProxy } from './config'
import { createBuild } from './config/build'
export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: 80,
      open: false,
      proxy: createViteProxy(env, viteEnv),
    },
    build: createBuild(env, viteEnv),
  }
})
