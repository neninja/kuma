import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/kuma/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('kuma-')
        }
      }
    })
  ],
  server: {
    allowedHosts: ['.ngrok-free.app']
  }
});
