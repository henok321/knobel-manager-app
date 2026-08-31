import { defineConfig } from '@playwright/test';

// E2E_EMAIL / E2E_PASSWORD for the playbook. Kept in an untracked .env.e2e so the
// credentials never reach a shell history or a transcript; plain env vars still win.
// Resolved against this file, not the working directory, so running the suite from
// a subdirectory cannot silently skip every test and still report success.
try {
  process.loadEnvFile(new URL('.env.e2e', import.meta.url));
} catch {
  // No local file — rely on the ambient environment.
}

export default defineConfig({
  testDir: './e2e',
  // The lifecycle test publishes the tournament the read-only tests read, so they
  // must not be reordered or run concurrently. No retries either: a failure here
  // is a real bug, not something a second attempt should paper over.
  workers: 1,
  retries: 0,
  // Generous against the deployed API, but bounded: the longest test measures ~45s.
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
