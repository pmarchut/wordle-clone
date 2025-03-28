import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: './vitest.setup.ts', // Optional setup file
  },
  plugins: [vue()]
});
