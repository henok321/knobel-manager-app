require('whatwg-fetch');

global.importMeta = {
  env: {
    PROD: false,
    VITE_API_URL: 'http://localhost:8080',
  },
};

require('@testing-library/jest-dom');
