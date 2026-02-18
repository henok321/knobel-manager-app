import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.knobel-manager.de/openapi.yaml',
  output: {
    path: 'src/generated',
    postProcess: ['eslint', 'prettier'],
  },
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/client-axios',
    },
  ],
});
