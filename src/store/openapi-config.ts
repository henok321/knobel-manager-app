import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile:
    'https://raw.githubusercontent.com/henok321/knobel-manager-service/main/openapi/openapi.yaml',
  apiFile: './baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};

export default config;
