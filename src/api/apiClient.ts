import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';

import { auth as firebaseAuth } from '../auth/firebaseConfig';
import { createClient } from '../generated/client';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost/api';
  }
  return '/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
    return config;
  },
  (error) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

export const client = createClient({
  axios: axiosInstance,
  throwOnError: true, // Ensure errors are thrown for proper async thunk handling
});

export const extractResponseData = <T>(
  response:
    | (AxiosResponse<T> & { error?: undefined })
    | (AxiosError & { data?: undefined; error: unknown }),
): T => {
  if ('error' in response && response.error !== undefined) {
    throw new Error(
      `API request failed: ${response.error instanceof Error ? response.error.message : String(response.error)}`,
    );
  }

  const data = response.data;

  if (
    data === null ||
    data === undefined ||
    (typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.keys(data).length === 0)
  ) {
    throw new Error(
      'Response data is empty. This should not happen with throwOnError: true.',
    );
  }

  return data;
};
