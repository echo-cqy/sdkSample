import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ⚠️ 注意：将 'sdk-sample' 替换为你的 GitHub 仓库名称
  // 例如：如果你的仓库地址是 https://github.com/username/my-sdk-project
  // 那么这里应该是 base: '/my-sdk-project/'
  base: '/sdk-sample/', 
})
