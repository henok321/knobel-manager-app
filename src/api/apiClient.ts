import axios from 'axios';
import { auth } from '../../firebase.ts';

const apiClient = axios.create({
  baseURL: 'https://knobel-manager-service-566295896360.europe-west1.run.app',
});

axios.interceptors.request.use(
  async (config) => {
    config.headers.token = await auth.currentUser?.getIdToken();
    return config;
  },
  (error) => Promise.reject(error),
);

type PingResponse = { message: string };

export const ping = async () => {
  const response = await apiClient.get<PingResponse>('/ping');
  return response.data;
};

export default apiClient;
