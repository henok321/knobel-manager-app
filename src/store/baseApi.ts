import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getBaseUrl } from '../api/apiClient.ts';
import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
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
