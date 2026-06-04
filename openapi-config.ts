import type { ConfigFile } from '@rtk-query/codegen-openapi';

// Generates RTK Query endpoints + hooks from the OpenAPI spec into
// src/store/generatedApi.ts, injected onto the baseApi. Tag/cache behavior
// is added separately in src/store/api.ts (enhanceEndpoints).
//
// The generated output is committed (like the backend's gen/ directory), so
// CI does not regenerate it. Run `pnpm api:gen` locally after the backend
// spec changes and commit the result. schemaFile targets the deployed spec so
// regeneration is environment-independent; when working against unreleased
// backend changes, point it at a local spec temporarily.
const config: ConfigFile = {
  schemaFile: 'https://api.knobel-manager.de/openapi.yaml',
  apiFile: './src/store/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/store/generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};

export default config;
