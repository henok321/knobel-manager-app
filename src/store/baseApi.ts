import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';

export const baseApi = createApi({
  reducerPath: 'api',
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.PROD ? import.meta.env.VITE_API_URL : '/api',
    prepareHeaders: async (headers) => {
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Game', 'Tables'],
  endpoints: () => ({}),
});
