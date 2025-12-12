import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api.knobel-manager.de/openapi.yaml',
  output: {
    path: 'src/generated',
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/client-axios',
    },
  ],
});
