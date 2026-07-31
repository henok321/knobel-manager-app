/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
module.exports = {
  schemaFile:
    'https://raw.githubusercontent.com/henok321/knobel-manager-service/main/openapi/openapi.yaml',
  apiFile: './baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './generatedApi.ts',
  exportName: 'generatedApi',
  hooks: true,
};
