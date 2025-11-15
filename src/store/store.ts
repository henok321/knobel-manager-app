import { configureStore } from '@reduxjs/toolkit';

import { api } from '../api/rtkQueryApi.ts';

const rootReducer = {
  [api.reducerPath]: api.reducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
