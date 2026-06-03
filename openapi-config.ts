import type { ConfigFile } from '@rtk-query/codegen-openapi';

// Generates RTK Query endpoints + hooks from the OpenAPI spec into
// src/store/generatedApi.ts, injected onto the baseApi. Tag/cache behavior
// is added separately in src/store/api.ts (enhanceEndpoints).
//
// For local development against the in-progress backend, point schemaFile at
// the sibling repo's spec. In CI/prod this should target the deployed spec
// (https://api.knobel-manager.de/openapi.yaml).
const config: ConfigFile = {
  schemaFile: '../knobel-manager-service/openapi/openapi.yaml',
  apiFile: './src/store/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/store/generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};

export default config;
