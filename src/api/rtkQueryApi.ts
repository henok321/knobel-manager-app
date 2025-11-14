import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './axiosBaseQuery';
import type {
  Table,
  ScoresRequest,
  TeamsRequest,
  TeamResponse,
  Team,
  Player,
  GamesResponse,
  GameResponse,
  GameCreateRequest,
  GameUpdateRequest,
} from '../generated';

export type TableWithRound = Table & { roundNumber: number };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Game', 'Team', 'Player', 'Table', 'Score'],
  endpoints: (builder) => ({
    getTablesForRound: builder.query<
      TableWithRound[],
      { gameId: number; roundNumber: number }
    >({
      query: ({ gameId, roundNumber }) => ({
        url: `/games/${gameId}/rounds/${roundNumber}/tables`,
        method: 'GET',
      }),
      transformResponse: (
        response: { tables: Table[] },
        _meta,
        arg,
      ): TableWithRound[] =>
        response.tables.map((table) => ({
          ...table,
          roundNumber: arg.roundNumber,
        })),
      providesTags: (result, _error, { gameId, roundNumber }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Table' as const, id })),
              { type: 'Table', id: `ROUND-${gameId}-${roundNumber}` },
            ]
          : [{ type: 'Table', id: `ROUND-${gameId}-${roundNumber}` }],
    }),

    getAllTablesForGame: builder.query<
      TableWithRound[],
      { gameId: number; numberOfRounds: number }
    >({
      async queryFn(
        { gameId, numberOfRounds },
        _api,
        _extraOptions,
        baseQuery,
      ) {
        const allTables: TableWithRound[] = [];

        for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
          const result = await baseQuery({
            url: `/games/${gameId}/rounds/${roundNum}/tables`,
            method: 'GET',
          });

          if (result.error) {
            return { error: result.error };
          }

          const response = result.data as { tables: Table[] };
          const tablesWithRoundNumber = response.tables.map((table) => ({
            ...table,
            roundNumber: roundNum,
          }));
          allTables.push(...tablesWithRoundNumber);
        }

        return { data: allTables };
      },
      providesTags: (result, _error, { gameId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Table' as const, id })),
              { type: 'Table', id: `GAME-${gameId}` },
            ]
          : [{ type: 'Table', id: `GAME-${gameId}` }],
    }),

    updateScores: builder.mutation<
      TableWithRound[],
      {
        gameId: number;
        roundNumber: number;
        tableNumber: number;
        scores: { playerID: number; score: number }[];
      }
    >({
      query: ({ gameId, roundNumber, tableNumber, scores }) => ({
        url: `/games/${gameId}/rounds/${roundNumber}/tables/${tableNumber}/scores`,
        method: 'PUT',
        data: { scores } as ScoresRequest,
      }),
      async onQueryStarted(
        { gameId, roundNumber, tableNumber, scores },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          api.util.updateQueryData(
            'getTablesForRound',
            { gameId, roundNumber },
            (draft) => {
              const table = draft.find((t) => t.tableNumber === tableNumber);
              if (table && table.players) {
                // Update scores optimistically
                table.players = table.players.map((player) => {
                  const scoreUpdate = scores.find(
                    (s) => s.playerID === player.id,
                  );
                  if (scoreUpdate) {
                    return { ...player, score: scoreUpdate.score };
                  }
                  return player;
                });
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      async onCacheEntryAdded(
        { gameId, roundNumber },
        { dispatch, cacheDataLoaded },
      ) {
        await cacheDataLoaded;
        dispatch(
          api.util.invalidateTags([
            { type: 'Table', id: `ROUND-${gameId}-${roundNumber}` },
            { type: 'Score' },
          ]),
        );
      },
    }),

    createTeam: builder.mutation<
      TeamResponse,
      { gameId: number; teamRequest: TeamsRequest }
    >({
      query: ({ gameId, teamRequest }) => ({
        url: `/games/${gameId}/teams`,
        method: 'POST',
        data: teamRequest,
      }),
      invalidatesTags: (_result, _error, { gameId }) => [
        { type: 'Game', id: gameId },
        { type: 'Team', id: 'LIST' },
        { type: 'Player', id: 'LIST' },
      ],
    }),

    updateTeam: builder.mutation<
      Team,
      { gameId: number; teamId: number; name: string }
    >({
      query: ({ gameId, teamId, name }) => ({
        url: `/games/${gameId}/teams/${teamId}`,
        method: 'PUT',
        data: { name },
      }),
      transformResponse: (response: TeamResponse) => response.team,
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'Team', id: teamId },
      ],
    }),

    deleteTeam: builder.mutation<void, { gameId: number; teamId: number }>({
      query: ({ gameId, teamId }) => ({
        url: `/games/${gameId}/teams/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gameId, teamId }) => [
        { type: 'Game', id: gameId },
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    updatePlayer: builder.mutation<
      Player,
      { gameId: number; teamId: number; playerId: number; name: string }
    >({
      query: ({ gameId, teamId, playerId, name }) => ({
        url: `/games/${gameId}/teams/${teamId}/players/${playerId}`,
        method: 'PUT',
        data: { name },
      }),
      transformResponse: (response: { player: Player }) => response.player,
      invalidatesTags: (_result, _error, { playerId }) => [
        { type: 'Player', id: playerId },
      ],
    }),

    deletePlayer: builder.mutation<
      void,
      { gameId: number; teamId: number; playerId: number }
    >({
      query: ({ gameId, teamId, playerId }) => ({
        url: `/games/${gameId}/teams/${teamId}/players/${playerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { playerId, teamId }) => [
        { type: 'Player', id: playerId },
        { type: 'Team', id: teamId },
      ],
    }),

    getGames: builder.query<GamesResponse, void>({
      query: () => ({ url: '/games', method: 'GET' }),
      providesTags: (result) =>
        result?.games
          ? [
              ...result.games.map(({ id }) => ({ type: 'Game' as const, id })),
              { type: 'Game', id: 'LIST' },
            ]
          : [{ type: 'Game', id: 'LIST' }],
    }),

    getGame: builder.query<GameResponse, number>({
      query: (gameId) => ({ url: `/games/${gameId}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Game', id }],
    }),

    createGame: builder.mutation<GameResponse, GameCreateRequest>({
      query: (gameRequest) => ({
        url: '/games',
        method: 'POST',
        data: gameRequest,
      }),
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
    }),

    updateGame: builder.mutation<
      GameResponse,
      { gameId: number; gameRequest: GameUpdateRequest }
    >({
      query: ({ gameId, gameRequest }) => ({
        url: `/games/${gameId}`,
        method: 'PUT',
        data: gameRequest,
      }),
      invalidatesTags: (_result, _error, { gameId }) => [
        { type: 'Game', id: gameId },
        { type: 'Game', id: 'LIST' },
      ],
    }),

    deleteGame: builder.mutation<void, number>({
      query: (gameId) => ({
        url: `/games/${gameId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, gameId) => [
        { type: 'Game', id: gameId },
        { type: 'Game', id: 'LIST' },
      ],
    }),

    setupGame: builder.mutation<GameResponse, number>({
      query: (gameId) => ({
        url: `/games/${gameId}/setup`,
        method: 'POST',
      }),
      async onQueryStarted(gameId, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          api.endpoints.getGame.initiate(gameId, { forceRefetch: true }),
        );
        dispatch(
          api.endpoints.getGames.initiate(undefined, { forceRefetch: true }),
        );
      },
      invalidatesTags: (_result, _error, gameId) => [
        { type: 'Game', id: gameId },
        { type: 'Game', id: 'LIST' },
        { type: 'Table', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllTablesForGameQuery,
  useUpdateScoresMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useGetGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useSetupGameMutation,
} = api;
