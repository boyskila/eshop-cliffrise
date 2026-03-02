import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
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
    // Build + preview with E2E flag so test-only runtime branches are deterministic.
    command:
      'cross-env E2E=true npm run astro -- build --mode test && cross-env E2E=true npm run preview -- --host 127.0.0.1 --port 4321',
    url: `http://127.0.0.1:4321`,
    // Prevent reusing stale servers built with different env/mode settings.
    reuseExistingServer: false,
  },
})
