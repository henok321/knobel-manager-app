import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.knobel-manager.de/openapi.yaml',
  output: {
    path: 'src/generated',
  },
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/client-fetch',
    },
  ],
});
