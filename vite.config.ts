import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/.netlify/functions/wordlist': {
        target: 'https://fly.wordfinderapi.com',
        changeOrigin: true,
        rewrite: () =>
          '/api/search?length=5&word_sorting=az&group_by_length=true&page_size=99999&dictionary=all_en',
      },
    },
  },
})
