import axios from 'axios';
import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';
import { Game } from '../slices/games/types.ts';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export type GamesResponse = {
  games: Game[];
  activeGameID: string;
};

export const getGames = async (): Promise<GamesResponse> => {
  const response = await apiClient.get<GamesResponse>('/games');
  return response.data;
};
