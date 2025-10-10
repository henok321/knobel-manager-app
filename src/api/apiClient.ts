import axios from 'axios';

import { auth as firebaseAuth } from '../auth/firebaseConfig';
import { GamesApi, PlayersApi, TeamsApi } from '../generated/api';
import { Configuration } from '../generated/configuration';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

const apiConfiguration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
  accessToken: async () => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    return idToken || '';
  },
});

export const gamesApi = new GamesApi(
  apiConfiguration,
  undefined,
  axiosInstance,
);
export const teamsApi = new TeamsApi(
  apiConfiguration,
  undefined,
  axiosInstance,
);
export const playersApi = new PlayersApi(
  apiConfiguration,
  undefined,
  axiosInstance,
);
