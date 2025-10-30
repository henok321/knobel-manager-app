const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, TransformStream } = require('web-streams-polyfill');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

class BroadcastChannelMock {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
global.BroadcastChannel = BroadcastChannelMock;

const localStorageMock = (() => {
  let store = new Map();
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => {
      store.set(key, value.toString());
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
})();

global.localStorage = localStorageMock;

global.importMeta = {
  env: {
    PROD: false,
    VITE_API_URL: 'http://localhost:8080',
  },
};

require('whatwg-fetch');
require('@testing-library/jest-dom');

jest.mock('./src/auth/firebaseConfig', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
}));

const { server } = require('./src/test/setup/msw');

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
