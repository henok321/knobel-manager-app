import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure output directory exists
const outputFile = './src/generated/api.ts';
mkdirSync(dirname(outputFile), { recursive: true });

// Run the codegen
execSync('rtk-query-codegen-openapi openapi-config.js', { stdio: 'inherit' });
