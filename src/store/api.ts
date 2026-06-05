import { generatedApi } from './generatedApi.ts';

const roundTablesTag = (gameId: number, roundNumber: number) =>
  `${gameId}:${roundNumber}`;
const gameTablesTag = (gameId: number) => `game:${gameId}`;

export const api = generatedApi.enhanceEndpoints({
  endpoints: {
    getGames: {
      providesTags: (result) => [
        { type: 'Game', id: 'LIST' },
        ...(result?.games ?? []).map((game) => ({
          type: 'Game' as const,
          id: game.id,
        })),
      ],
    },
    getGame: {
      providesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    getTables: {
      providesTags: (_result, _error, arg) => [
        { type: 'Tables', id: roundTablesTag(arg.gameId, arg.roundNumber) },
      ],
    },
    getGameTables: {
      providesTags: (_result, _error, arg) => [
        { type: 'Tables', id: gameTablesTag(arg.gameId) },
      ],
    },
    createGame: {
      invalidatesTags: [{ type: 'Game', id: 'LIST' }],
    },
    updateGame: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
        { type: 'Game', id: 'LIST' },
      ],
    },
    deleteGame: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: 'LIST' },
        { type: 'Game', id: arg.gameId },
      ],
    },
    setupGame: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
        { type: 'Tables', id: gameTablesTag(arg.gameId) },
      ],
    },
    createTeam: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    updateTeam: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    deleteTeam: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    createPlayer: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    updatePlayer: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    deletePlayer: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Game', id: arg.gameId },
      ],
    },
    updateScores: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Tables', id: roundTablesTag(arg.gameId, arg.roundNumber) },
        { type: 'Tables', id: gameTablesTag(arg.gameId) },
      ],
    },
  },
});

export const {
  useGetGamesQuery,
  useGetGameQuery,
  useGetTablesQuery,
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
