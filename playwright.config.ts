import { defineConfig } from '@playwright/test';

// set E2E_EMAIL and E2E_PASSWORD or use .env.e2e
process.loadEnvFile(new URL('.env.e2e', import.meta.url));

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://localhost:5173',
    // `pnpm local` serves a self-signed cert.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
