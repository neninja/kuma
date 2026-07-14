import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('kuma-')
        }
      }
    })
  ],
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.spec.ts']
  }
});
