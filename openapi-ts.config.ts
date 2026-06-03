import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.knobel-manager.de/openapi.yaml',
  output: {
    path: 'src/generated',
  },
  // Types only. The data-fetching layer is a hand-written RTK Query slice
  // (src/store/apiSlice.ts), so the generated runtime client/SDK is not used.
  plugins: ['@hey-api/typescript'],
});
