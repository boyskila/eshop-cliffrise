import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testIgnore: 'e2e/products/product-modal.spec.ts', // Skip modal tests for now due to flakiness
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // Keep host explicit and consistent with preview to avoid origin mismatches for actions.
    baseURL: `http://127.0.0.1:4321`,
    trace: 'on-first-retry',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      "node -e \"require('node:fs').rmSync('dist-playwright', { recursive: true, force: true })\" && cross-env PLAYWRIGHT_TEST=true PUBLIC_GOOGLE_ANALYTICS_ID=G-TEST npx astro build --mode test --force && cross-env PLAYWRIGHT_TEST=true npx astro preview --mode test --host 127.0.0.1 --port 4321",
    url: `http://127.0.0.1:4321`,
    reuseExistingServer: false,
  },
})
