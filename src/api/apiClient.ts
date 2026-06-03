export const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL as string;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost/api';
  }
  return '/api';
};
