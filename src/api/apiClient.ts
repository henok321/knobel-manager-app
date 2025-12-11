import axios from 'axios';

import { auth as firebaseAuth } from '../auth/firebaseConfig';
import { createClient } from '../generated/client';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof globalThis.window === 'undefined') {
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
  baseURL: getBaseURL(),
  throwOnError: true, // Ensure errors are thrown for proper async thunk handling
});

export const GameStatus = {
  Setup: 'setup',
  InProgress: 'in_progress',
  Completed: 'completed',
} as const;

export const RoundStatus = {
  Setup: 'setup',
  InProgress: 'in_progress',
  Completed: 'completed',
} as const;
