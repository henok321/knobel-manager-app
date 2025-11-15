import {
  enhancedApi,
  type Table,
  type GameCreateRequest,
  type GameResponse,
  type GetGamesApiResponse,
  type UpdateGameApiArg,
  type CreateTeamApiArg,
  type UpdateTeamApiArg,
  type UpdatePlayerApiArg,
  type UpdateScoresApiArg,
} from './generatedEndpoints';

export type TableWithRound = Table & { roundNumber: number };

// Enhance the generated API with custom logic
export const api = enhancedApi.injectEndpoints({
  endpoints: (builder) => ({
    // Custom endpoint: Fetch all tables for all rounds in a game
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
              ...result.map(({ id }) => ({ type: 'Tables' as const, id })),
              { type: 'Tables', id: `GAME-${gameId}` },
            ]
          : [{ type: 'Tables', id: `GAME-${gameId}` }],
    }),

    // Override getTables to add roundNumber to response and improve tag granularity
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
      providesTags: (result, _error, { gameId, roundNumber }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tables' as const, id })),
              { type: 'Tables', id: `ROUND-${gameId}-${roundNumber}` },
            ]
          : [{ type: 'Tables', id: `ROUND-${gameId}-${roundNumber}` }],
    }),

    // Override updateScores to add optimistic updates
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
        const patchResult = dispatch(
          api.util.updateQueryData(
            'getTables',
            { gameId, roundNumber },
            (draft) => {
              const table = draft.find((t) => t.tableNumber === tableNumber);
              if (table && table.players) {
                // Update scores optimistically
                table.players = table.players.map((player) => {
                  const scoreUpdate = scoresRequest.scores.find(
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
            { type: 'Tables', id: `ROUND-${gameId}-${roundNumber}` },
            { type: 'Scores' },
          ]),
        );
      },
    }),

    // Override setupGame to trigger refetches
    setupGame: builder.mutation<unknown, number>({
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
        { type: 'Games', id: gameId },
        { type: 'Games', id: 'LIST' },
        { type: 'Tables', id: 'LIST' },
      ],
    }),

    // Override getGames to improve tag granularity
    getGames: builder.query<GetGamesApiResponse, void>({
      query: () => ({ url: '/games', method: 'GET' }),
      providesTags: (result) =>
        result?.games
          ? [
              ...result.games.map((game) => ({
                type: 'Games' as const,
                id: game.id,
              })),
              { type: 'Games', id: 'LIST' },
            ]
          : [{ type: 'Games', id: 'LIST' }],
    }),

    // Override getGame to add id-based tag
    getGame: builder.query<GameResponse, number>({
      query: (gameId) => ({ url: `/games/${gameId}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Games', id }],
    }),

    // Override createGame to invalidate LIST tag
    createGame: builder.mutation<GameResponse, GameCreateRequest>({
      query: (gameRequest) => ({
        url: '/games',
        method: 'POST',
        body: gameRequest,
      }),
      invalidatesTags: [{ type: 'Games', id: 'LIST' }],
    }),

    // Override updateGame to invalidate both specific game and LIST
    updateGame: builder.mutation<GameResponse, UpdateGameApiArg>({
      query: ({ gameId, gameUpdateRequest }) => ({
        url: `/games/${gameId}`,
        method: 'PUT',
        body: gameUpdateRequest,
      }),
      invalidatesTags: (_result, _error, { gameId }) => [
        { type: 'Games', id: gameId },
        { type: 'Games', id: 'LIST' },
      ],
    }),

    // Override deleteGame to invalidate both specific game and LIST
    deleteGame: builder.mutation<void, number>({
      query: (gameId) => ({
        url: `/games/${gameId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, gameId) => [
        { type: 'Games', id: gameId },
        { type: 'Games', id: 'LIST' },
      ],
    }),

    // Override createTeam to invalidate Game and add LIST tags
    createTeam: builder.mutation<GameResponse, CreateTeamApiArg>({
      query: ({ gameId, teamsRequest }) => ({
        url: `/games/${gameId}/teams`,
        method: 'POST',
        body: teamsRequest,
      }),
      invalidatesTags: (_result, _error, { gameId }) => [
        { type: 'Games', id: gameId },
        { type: 'Teams', id: 'LIST' },
        { type: 'Players', id: 'LIST' },
      ],
    }),

    // Override updateTeam to use id-based tag
    updateTeam: builder.mutation<GameResponse, UpdateTeamApiArg>({
      query: ({ gameId, teamId, teamsRequest }) => ({
        url: `/games/${gameId}/teams/${teamId}`,
        method: 'PUT',
        body: teamsRequest,
      }),
      invalidatesTags: (_result, _error, { teamId }) => [
        { type: 'Teams', id: teamId },
      ],
    }),

    // Override deleteTeam to invalidate Game and team-specific tags
    deleteTeam: builder.mutation<void, { gameId: number; teamId: number }>({
      query: ({ gameId, teamId }) => ({
        url: `/games/${gameId}/teams/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gameId, teamId }) => [
        { type: 'Games', id: gameId },
        { type: 'Teams', id: teamId },
        { type: 'Teams', id: 'LIST' },
      ],
    }),

    // Override updatePlayer to use id-based tag
    updatePlayer: builder.mutation<GameResponse, UpdatePlayerApiArg>({
      query: ({ gameId, teamId, playerId, playersRequest }) => ({
        url: `/games/${gameId}/teams/${teamId}/players/${playerId}`,
        method: 'PUT',
        body: playersRequest,
      }),
      invalidatesTags: (_result, _error, { playerId }) => [
        { type: 'Players', id: playerId },
      ],
    }),

    // Override deletePlayer to invalidate both player and team
    deletePlayer: builder.mutation<
      void,
      { gameId: number; teamId: number; playerId: number }
    >({
      query: ({ gameId, teamId, playerId }) => ({
        url: `/games/${gameId}/teams/${teamId}/players/${playerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { playerId, teamId }) => [
        { type: 'Players', id: playerId },
        { type: 'Teams', id: teamId },
      ],
    }),
  }),
  overrideExisting: true,
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
