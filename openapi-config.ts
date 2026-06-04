import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://api.knobel-manager.de/openapi.yaml',
  apiFile: './src/store/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/store/generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};

export default config;
