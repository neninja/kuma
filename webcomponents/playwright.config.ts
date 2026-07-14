import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: 5_000
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  reporter: process.env.CI
    ? [['dot'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'vite --host 127.0.0.1 --port 4174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:4174/tests/fixtures/index.html'
  }
});
