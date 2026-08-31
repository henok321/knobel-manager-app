import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // The playbook is one long linear tournament: no parallelism, no retries, so a
  // failure is always reproducible rather than papered over by a second attempt.
  workers: 1,
  retries: 0,
  fullyParallel: false,
  timeout: 15 * 60 * 1000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:5173',
    // `pnpm local` serves a self-signed cert.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
