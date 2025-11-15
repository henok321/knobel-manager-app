const config = {
  schemaFile: 'https://knobel-manager-service.fly.dev/openapi.yaml',
  apiFile: './src/api/emptyApi.ts',
  outputFile: './src/generated/api.ts',
  exportName: 'enhancedApi',
  hooks: true,
  tag: true,
};

export default config;
