import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { api } from './api.ts';

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // oxlint-disable-next-line unicorn/prefer-spread -- typed builder, spread loses .prepend
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export default store;
