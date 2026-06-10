import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';

const getBaseUrl = () => {
  const useLocalProxy = !import.meta.env.PROD;
  if (useLocalProxy) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL as string;
};

export const baseApi = createApi({
  reducerPath: 'api',
  refetchOnFocus: true,
  refetchOnReconnect: true,
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
