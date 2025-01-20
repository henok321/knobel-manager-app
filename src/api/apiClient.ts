import axios from 'axios';
import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';
import { GameRequest, GameResponse, GamesResponse } from './types.ts';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export const getGames = async (): Promise<GamesResponse> => {
  const response = await apiClient.get<GamesResponse>('/games');
  return response.data;
};

export const createGame = async (
  gameRequest: GameRequest,
): Promise<GameResponse> => {
  const response = await apiClient.post('/games', gameRequest);
  return response.data;
};

export const deleteGame = async (gameID: number) => {
  await apiClient.delete(`/games/${gameID}`);
};

export const activateGame = async (gameID: number) => {
  await apiClient.post(`games/${gameID}/activate`);
};
