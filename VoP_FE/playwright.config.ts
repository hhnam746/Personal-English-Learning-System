import { defineConfig } from '@playwright/test'
if (!process.env.VOP_TEST_API_URL)
  throw new Error(
    'Set VOP_TEST_API_URL to an isolated test API. Do not run write tests against the personal database.'
  )
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5175',
    headless: true,
    launchOptions: { executablePath: process.env.CHROMIUM_EXECUTABLE },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'pnpm dev --port 5175',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
    env: { API_PROXY_TARGET: process.env.VOP_TEST_API_URL }
  },
  reporter: 'list'
})
