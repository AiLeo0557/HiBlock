import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  // 获取当前项目路径
  const root = process.cwd()
  // 获取当前环境变量
  const env = loadEnv(mode, root)
  console.log('env', env)
  return {
    plugins: [
      vue(),
      vueJsx({
        // 启用对象形式 props（可选）
        transformOn: true,
        // 优化 class 和 style 属性（可选）
        mergeProps: true
      })
    ],
    optimizeDeps: {
      include: ['@hi-block/components']
    }
  }
})
