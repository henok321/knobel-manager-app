import axios from 'axios';
import { auth } from '../../firebase.ts';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    const idToken = await auth.currentUser?.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

type PingResponse = { message: string };

export const ping = async () => {
  const response = await apiClient.get<PingResponse>('/ping');
  return response.data;
};
