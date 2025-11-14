import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './axiosBaseQuery';
import type { Table, ScoresRequest } from '../generated';

// Augmented Table type with roundNumber
export type TableWithRound = Table & { roundNumber: number };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Game', 'Team', 'Player', 'Table', 'Score'],
  endpoints: (builder) => ({
    // Tables endpoints
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
      // Optimistic update
      async onQueryStarted(
        { gameId, roundNumber, tableNumber, scores },
        { dispatch, queryFulfilled },
      ) {
        // Optimistically update the cache
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
          // Rollback on error
          patchResult.undo();
        }
      },
      // After successful update, refetch to get server state
      async onCacheEntryAdded(
        { gameId, roundNumber },
        { dispatch, cacheDataLoaded },
      ) {
        await cacheDataLoaded;
        // Invalidate to trigger refetch with server data
        dispatch(
          api.util.invalidateTags([
            { type: 'Table', id: `ROUND-${gameId}-${roundNumber}` },
            { type: 'Score' },
          ]),
        );
      },
    }),
  }),
});

export const {
  useGetTablesForRoundQuery,
  useGetAllTablesForGameQuery,
  useUpdateScoresMutation,
} = api;
