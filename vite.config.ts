import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 添加这一行，/<仓库名>/
  // 例如你的仓库叫 upc-frontend，这里就填 /upc-frontend/
  base: '/upc-frontend/', 
})
