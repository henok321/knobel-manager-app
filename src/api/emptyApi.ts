import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { auth as firebaseAuth } from '../auth/firebaseConfig';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost/api';
  }
  return '/api';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseURL(),
  prepareHeaders: async (headers) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    if (idToken) {
      headers.set('Authorization', `Bearer ${idToken}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [],
  endpoints: () => ({}),
});
