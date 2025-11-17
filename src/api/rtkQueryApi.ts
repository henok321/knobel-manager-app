import {
  enhancedApi,
  type Table,
  type UpdateScoresApiArg,
  type GameResponse,
} from '../generated/api';

export type TableWithRound = Table & { roundNumber: number };

export const api = enhancedApi
  .enhanceEndpoints({
    endpoints: {
      getGames: {
        providesTags: (result) =>
          result?.games
            ? [
                'Games',
                ...result.games.map((game) => ({
                  type: 'Games' as const,
                  id: game.id,
                })),
              ]
            : ['Games'],
      },
      getGame: {
        providesTags: (_result, _error, { gameId }) => [
          { type: 'Games', id: gameId },
        ],
      },
      createTeam: {
        invalidatesTags: (_result, _error, { gameId }) => [
          'Teams',
          { type: 'Games', id: gameId },
        ],
      },
      updateTeam: {
        invalidatesTags: (_result, _error, { gameId }) => [
          'Teams',
          { type: 'Games', id: gameId },
        ],
      },
      deleteTeam: {
        invalidatesTags: (_result, _error, { gameId }) => [
          'Teams',
          { type: 'Games', id: gameId },
        ],
      },
      updatePlayer: {
        invalidatesTags: (_result, _error, { gameId }) => [
          'Players',
          { type: 'Games', id: gameId },
        ],
      },
      deletePlayer: {
        invalidatesTags: (_result, _error, { gameId }) => [
          'Players',
          { type: 'Games', id: gameId },
        ],
      },
    },
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getTables: builder.query<
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
        providesTags: (_result, _error, { gameId, roundNumber }) => [
          { type: 'Tables', id: `ROUND-${gameId}-${roundNumber}` },
        ],
      }),

      updateScores: builder.mutation<GameResponse, UpdateScoresApiArg>({
        query: ({ gameId, roundNumber, tableNumber, scoresRequest }) => ({
          url: `/games/${gameId}/rounds/${roundNumber}/tables/${tableNumber}/scores`,
          method: 'PUT',
          body: scoresRequest,
        }),
        async onQueryStarted(
          { gameId, roundNumber, tableNumber, scoresRequest },
          { dispatch, queryFulfilled },
        ) {
          const patchGetTables = dispatch(
            api.util.updateQueryData(
              'getTables',
              { gameId, roundNumber },
              (draft) => {
                const table = draft.find((t) => t.tableNumber === tableNumber);
                if (table) {
                  if (!table.scores) {
                    table.scores = [];
                  }
                  scoresRequest.scores.forEach((scoreUpdate) => {
                    const existingScore = table.scores?.find(
                      (s) => s.playerID === scoreUpdate.playerID,
                    );
                    if (existingScore) {
                      existingScore.score = scoreUpdate.score;
                    } else {
                      // Add new score entry with placeholder id and tableID
                      table.scores?.push({
                        id: 0,
                        tableID: table.id,
                        playerID: scoreUpdate.playerID,
                        score: scoreUpdate.score,
                      });
                    }
                  });
                }
              },
            ),
          );

          try {
            await queryFulfilled;
          } catch {
            patchGetTables.undo();
          }
        },
        invalidatesTags: (_result, _error, { gameId }) => [
          { type: 'Games', id: gameId },
        ],
      }),

      setupGame: builder.mutation<unknown, { gameId: number }>({
        query: ({ gameId }) => ({
          url: `/games/${gameId}/setup`,
          method: 'POST',
        }),
        invalidatesTags: (_result, _error, { gameId }) => [
          { type: 'Games', id: gameId },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const { useUpdateScoresMutation, useSetupGameMutation } = api;

export {
  useGetGamesQuery,
  useGetGameQuery,
  useUpdateGameMutation,
  useCreateGameMutation,
  useDeleteGameMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useUpdatePlayerMutation,
} from '../generated/api';
