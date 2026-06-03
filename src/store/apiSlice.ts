import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getBaseUrl } from '../api/apiClient.ts';
import { auth as firebaseAuth } from '../auth/firebaseConfig.ts';
import type {
  Game,
  GameCreateRequest,
  GameResponse,
  GamesResponse,
  GameUpdateRequest,
  PlayersRequest,
  PlayersResponse,
  ScoresRequest,
  Table,
  TablesResponse,
  TeamResponse,
  TeamsRequest,
} from '../generated/types.gen.ts';

const tablesTagId = (gameID: number, roundNumber: number) =>
  `${gameID}:${roundNumber}`;
const gameTablesTagId = (gameID: number) => `game:${gameID}`;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: async (headers) => {
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Game', 'Tables'],
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => '/games',
      transformResponse: (response: GamesResponse) => response.games,
      providesTags: (games) => [
        { type: 'Game' as const, id: 'LIST' },
        ...(games ?? []).map((game) => ({
          type: 'Game' as const,
          id: game.id,
        })),
      ],
    }),
    getGame: builder.query<Game, number>({
      query: (gameID) => `/games/${gameID}`,
      transformResponse: (response: GameResponse) => response.game,
      providesTags: (_result, _error, gameID) => [{ type: 'Game', id: gameID }],
    }),
    getTablesForRound: builder.query<
      Table[],
      { gameID: number; roundNumber: number }
    >({
      query: ({ gameID, roundNumber }) =>
        `/games/${gameID}/rounds/${roundNumber}/tables`,
      transformResponse: (response: TablesResponse) => response.tables,
      providesTags: (_result, _error, { gameID, roundNumber }) => [
        { type: 'Tables', id: tablesTagId(gameID, roundNumber) },
      ],
    }),
    getGameTables: builder.query<Table[], number>({
      query: (gameID) => `/games/${gameID}/tables`,
      transformResponse: (response: TablesResponse) => response.tables,
      providesTags: (_result, _error, gameID) => [
        { type: 'Tables', id: gameTablesTagId(gameID) },
      ],
    }),
    createGame: builder.mutation<GameResponse, GameCreateRequest>({
      query: (body) => ({
        url: '/games',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
    }),
    updateGame: builder.mutation<
      GameResponse,
      { gameID: number; body: GameUpdateRequest }
    >({
      query: ({ gameID, body }) => ({
        url: `/games/${gameID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { gameID }) => [
        { type: 'Game', id: gameID },
        { type: 'Game', id: 'LIST' },
      ],
    }),
    deleteGame: builder.mutation<void, number>({
      query: (gameID) => ({
        url: `/games/${gameID}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, gameID) => [
        { type: 'Game', id: 'LIST' },
        { type: 'Game', id: gameID },
      ],
    }),
    setupGame: builder.mutation<void, number>({
      query: (gameID) => ({
        url: `/games/${gameID}/setup`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, gameID) => [
        { type: 'Game', id: gameID },
        // Setup (re)assigns tables for every round; round numbers are not known
        // here, so invalidate all cached Tables entries for a clean refetch.
        { type: 'Tables' },
      ],
    }),
    createTeam: builder.mutation<
      TeamResponse,
      { gameID: number; body: TeamsRequest }
    >({
      query: ({ gameID, body }) => ({
        url: `/games/${gameID}/teams`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { gameID }) => [
        { type: 'Game', id: gameID },
      ],
    }),
    updateTeam: builder.mutation<
      TeamResponse,
      { gameID: number; teamID: number; body: TeamsRequest }
    >({
      query: ({ gameID, teamID, body }) => ({
        url: `/games/${gameID}/teams/${teamID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { gameID }) => [
        { type: 'Game', id: gameID },
      ],
    }),
    deleteTeam: builder.mutation<void, { gameID: number; teamID: number }>({
      query: ({ gameID, teamID }) => ({
        url: `/games/${gameID}/teams/${teamID}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gameID }) => [
        { type: 'Game', id: gameID },
      ],
    }),
    updatePlayer: builder.mutation<
      PlayersResponse,
      { gameID: number; teamID: number; playerID: number; body: PlayersRequest }
    >({
      query: ({ gameID, teamID, playerID, body }) => ({
        url: `/games/${gameID}/teams/${teamID}/players/${playerID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { gameID }) => [
        { type: 'Game', id: gameID },
      ],
    }),
    updateScores: builder.mutation<
      Table,
      {
        gameID: number;
        roundNumber: number;
        tableNumber: number;
        scores: ScoresRequest;
      }
    >({
      query: ({ gameID, roundNumber, tableNumber, scores }) => ({
        url: `/games/${gameID}/rounds/${roundNumber}/tables/${tableNumber}/scores`,
        method: 'PUT',
        body: scores,
      }),
      invalidatesTags: (_result, _error, { gameID, roundNumber }) => [
        { type: 'Tables', id: tablesTagId(gameID, roundNumber) },
        { type: 'Tables', id: gameTablesTagId(gameID) },
      ],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetGameQuery,
  useGetTablesForRoundQuery,
  useGetGameTablesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useSetupGameMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useUpdatePlayerMutation,
  useUpdateScoresMutation,
} = api;
