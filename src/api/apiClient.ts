import { auth as firebaseAuth } from '../auth/firebaseConfig';
import { createClient, createConfig } from '../generated/client';

const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL as string;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost/api';
  }
  return '/api';
};

export const client = createClient(
  createConfig({
    auth: () => firebaseAuth.currentUser?.getIdToken(),
    baseUrl: getBaseUrl(),
    throwOnError: true,
  }),
);
