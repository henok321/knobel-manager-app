import { generatedApi } from './generatedApi.ts';

const gameTag = (id: number) => ({ type: 'Game' as const, id });
const gameList = { type: 'Game' as const, id: 'LIST' };
const tableTag = (gameId: number, roundNumber: number) => ({
  type: 'Tables' as const,
  id: `${gameId}:${roundNumber}`,
});
const gameTablesTag = (gameId: number) => ({
  type: 'Tables' as const,
  id: `game:${gameId}`,
});

const invalidatesGame = (_r: unknown, _e: unknown, arg: { gameId: number }) => [
  gameTag(arg.gameId),
];

export const api = generatedApi.enhanceEndpoints({
  endpoints: {
    getGames: {
      providesTags: (result) => [
        gameList,
        ...(result?.games ?? []).map((game) => gameTag(game.id)),
      ],
    },
    getGame: { providesTags: (_r, _e, a) => [gameTag(a.gameId)] },
    getTables: {
      providesTags: (_r, _e, a) => [tableTag(a.gameId, a.roundNumber)],
    },
    getTable: {
      providesTags: (_r, _e, a) => [tableTag(a.gameId, a.roundNumber)],
    },
    getGameTables: { providesTags: (_r, _e, a) => [gameTablesTag(a.gameId)] },
    createGame: { invalidatesTags: [gameList] },
    updateGame: {
      invalidatesTags: (_r, _e, a) => [gameTag(a.gameId), gameList],
    },
    deleteGame: {
      invalidatesTags: (_r, _e, a) => [gameList, gameTag(a.gameId)],
    },
    setupGame: {
      invalidatesTags: (_r, _e, a) => [gameTag(a.gameId), { type: 'Tables' }],
    },
    createTeam: { invalidatesTags: invalidatesGame },
    updateTeam: { invalidatesTags: invalidatesGame },
    deleteTeam: { invalidatesTags: invalidatesGame },
    createPlayer: { invalidatesTags: invalidatesGame },
    updatePlayer: { invalidatesTags: invalidatesGame },
    deletePlayer: { invalidatesTags: invalidatesGame },
    updateScores: {
      invalidatesTags: (_r, _e, a) => [
        tableTag(a.gameId, a.roundNumber),
        gameTablesTag(a.gameId),
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
