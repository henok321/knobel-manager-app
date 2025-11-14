import axios from 'axios';

import { auth as firebaseAuth } from '../auth/firebaseConfig';
import {
  Configuration,
  GamesApi,
  PlayersApi,
  ScoresApi,
  TablesApi,
  TeamsApi,
} from '../generated';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost/api';
  }
  return '/api';
};

export const axiosInstance = axios.create({
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

const apiConfiguration = new Configuration();

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
export const tablesApi = new TablesApi(
  apiConfiguration,
  undefined,
  axiosInstance,
);
export const scoresApi = new ScoresApi(
  apiConfiguration,
  undefined,
  axiosInstance,
);
