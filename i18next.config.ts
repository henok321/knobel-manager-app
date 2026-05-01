import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['en', 'de'],
  extract: {
    input: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/i18n/**'],
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    nsSeparator: ':',
    keySeparator: '.',
    removeUnusedKeys: true,
    sort: true,
  },
});
