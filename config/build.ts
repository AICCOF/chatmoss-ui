import type { ConfigEnv } from 'vite'
export function createBuild(env: ConfigEnv, viteEnv: ImportMetaEnv) {
  let defaultOption = {
    reportCompressedSize: false,
    sourcemap: false,
    commonjsOptions: {
      ignoreTryCatch: false,
    },
  }
  let rollupOptions = {
  
    output: {
      entryFileNames: '[name].js',
      assetFileNames: '[name].[ext]'
    }
  }
  if (env.mode !=='vscode'){
    return defaultOption
  }
  // vscode 打包的目录
  return {
    outDir: 'vscode',
    rollupOptions,
    ...defaultOption, 
  }

  
  
}
