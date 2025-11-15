import { api } from './emptyApi';
export const addTagTypes = [
  'Health',
  'Games',
  'Teams',
  'Players',
  'Tables',
  'Scores',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      livenessCheck: build.query<LivenessCheckApiResponse, LivenessCheckApiArg>(
        {
          query: () => ({ url: `/health/live` }),
          providesTags: ['Health'],
        },
      ),
      readinessCheck: build.query<
        ReadinessCheckApiResponse,
        ReadinessCheckApiArg
      >({
        query: () => ({ url: `/health/ready` }),
        providesTags: ['Health'],
      }),
      getGames: build.query<GetGamesApiResponse, GetGamesApiArg>({
        query: () => ({ url: `/games` }),
        providesTags: ['Games'],
      }),
      createGame: build.mutation<CreateGameApiResponse, CreateGameApiArg>({
        query: (queryArg) => ({
          url: `/games`,
          method: 'POST',
          body: queryArg.gameCreateRequest,
        }),
        invalidatesTags: ['Games'],
      }),
      getGame: build.query<GetGameApiResponse, GetGameApiArg>({
        query: (queryArg) => ({ url: `/games/${queryArg.gameId}` }),
        providesTags: ['Games'],
      }),
      updateGame: build.mutation<UpdateGameApiResponse, UpdateGameApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}`,
          method: 'PUT',
          body: queryArg.gameUpdateRequest,
        }),
        invalidatesTags: ['Games'],
      }),
      deleteGame: build.mutation<DeleteGameApiResponse, DeleteGameApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Games'],
      }),
      setupGame: build.mutation<SetupGameApiResponse, SetupGameApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/setup`,
          method: 'POST',
        }),
        invalidatesTags: ['Games'],
      }),
      createTeam: build.mutation<CreateTeamApiResponse, CreateTeamApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/teams`,
          method: 'POST',
          body: queryArg.teamsRequest,
        }),
        invalidatesTags: ['Teams'],
      }),
      updateTeam: build.mutation<UpdateTeamApiResponse, UpdateTeamApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}`,
          method: 'PUT',
          body: queryArg.teamsRequest,
        }),
        invalidatesTags: ['Teams'],
      }),
      deleteTeam: build.mutation<DeleteTeamApiResponse, DeleteTeamApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Teams'],
      }),
      createPlayer: build.mutation<CreatePlayerApiResponse, CreatePlayerApiArg>(
        {
          query: (queryArg) => ({
            url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players`,
            method: 'POST',
            body: queryArg.playersRequest,
          }),
          invalidatesTags: ['Players'],
        },
      ),
      updatePlayer: build.mutation<UpdatePlayerApiResponse, UpdatePlayerApiArg>(
        {
          query: (queryArg) => ({
            url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players/${queryArg.playerId}`,
            method: 'PUT',
            body: queryArg.playersRequest,
          }),
          invalidatesTags: ['Players'],
        },
      ),
      deletePlayer: build.mutation<DeletePlayerApiResponse, DeletePlayerApiArg>(
        {
          query: (queryArg) => ({
            url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players/${queryArg.playerId}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['Players'],
        },
      ),
      getTables: build.query<GetTablesApiResponse, GetTablesApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables`,
        }),
        providesTags: ['Tables'],
      }),
      getTable: build.query<GetTableApiResponse, GetTableApiArg>({
        query: (queryArg) => ({
          url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables/${queryArg.tableNumber}`,
        }),
        providesTags: ['Tables'],
      }),
      updateScores: build.mutation<UpdateScoresApiResponse, UpdateScoresApiArg>(
        {
          query: (queryArg) => ({
            url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables/${queryArg.tableNumber}/scores`,
            method: 'PUT',
            body: queryArg.scoresRequest,
          }),
          invalidatesTags: ['Scores'],
        },
      ),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as enhancedApi };
export type LivenessCheckApiResponse =
  /** status 200 Process is alive */ HealthCheckResponse;
export type LivenessCheckApiArg = void;
export type ReadinessCheckApiResponse =
  /** status 200 Service is ready to serve traffic */ HealthCheckDetailedResponse;
export type ReadinessCheckApiArg = void;
export type GetGamesApiResponse =
  /** status 200 Games list (can be empty) */ GamesResponse;
export type GetGamesApiArg = void;
export type CreateGameApiResponse = /** status 201 Game created */ GameResponse;
export type CreateGameApiArg = {
  gameCreateRequest: GameCreateRequest;
};
export type GetGameApiResponse = /** status 200 Game found */ Game;
export type GetGameApiArg = {
  gameId: number;
};
export type UpdateGameApiResponse = /** status 200 Game updated */ GameResponse;
export type UpdateGameApiArg = {
  gameId: number;
  gameUpdateRequest: GameUpdateRequest;
};
export type DeleteGameApiResponse = unknown;
export type DeleteGameApiArg = {
  gameId: number;
};
export type SetupGameApiResponse = unknown;
export type SetupGameApiArg = {
  gameId: number;
};
export type CreateTeamApiResponse = /** status 201 Team created */ TeamResponse;
export type CreateTeamApiArg = {
  gameId: number;
  teamsRequest: TeamsRequest;
};
export type UpdateTeamApiResponse = /** status 200 Team updated */ TeamResponse;
export type UpdateTeamApiArg = {
  gameId: number;
  teamId: number;
  teamsRequest: TeamsRequest;
};
export type DeleteTeamApiResponse = unknown;
export type DeleteTeamApiArg = {
  gameId: number;
  teamId: number;
};
export type CreatePlayerApiResponse =
  /** status 201 Player created */ PlayersResponse;
export type CreatePlayerApiArg = {
  gameId: number;
  teamId: number;
  playersRequest: PlayersRequest;
};
export type UpdatePlayerApiResponse =
  /** status 200 Player updated */ PlayersResponse;
export type UpdatePlayerApiArg = {
  gameId: number;
  teamId: number;
  playerId: number;
  playersRequest: PlayersRequest;
};
export type DeletePlayerApiResponse = unknown;
export type DeletePlayerApiArg = {
  gameId: number;
  teamId: number;
  playerId: number;
};
export type GetTablesApiResponse =
  /** status 200 Tables found */ TablesResponse;
export type GetTablesApiArg = {
  gameId: number;
  roundNumber: number;
};
export type GetTableApiResponse = /** status 200 Table found */ Table;
export type GetTableApiArg = {
  gameId: number;
  roundNumber: number;
  tableNumber: number;
};
export type UpdateScoresApiResponse =
  /** status 200 Updated game with new scores */ GameResponse;
export type UpdateScoresApiArg = {
  gameId: number;
  roundNumber: number;
  tableNumber: number;
  scoresRequest: ScoresRequest;
};
export type HealthCheckResponse = {
  status: string;
};
export type HealthCheckDetailedResponse = {
  status: 'healthy' | 'unhealthy' | 'draining';
  checks?: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
    };
  };
};
export type GameOwner = {
  gameID: number;
  ownerSub: string;
};
export type Player = {
  id: number;
  name: string;
  teamID: number;
};
export type Team = {
  id: number;
  name: string;
  gameID: number;
  players?: Player[];
};
export type RoundStatus = 'setup' | 'in_progress' | 'completed';
export type Score = {
  id: number;
  playerID: number;
  tableID: number;
  score: number;
};
export type Table = {
  id: number;
  tableNumber: number;
  roundID: number;
  players?: Player[];
  scores?: Score[];
};
export type GameRound = {
  id: number;
  gameID: number;
  roundNumber: number;
  status: RoundStatus;
  tables?: Table[];
};
export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: 'setup' | 'in_progress' | 'completed';
  owners: GameOwner[];
  teams?: Team[];
  rounds?: GameRound[];
};
export type GamesResponse = {
  games: Game[];
};
export type Error = {
  error: string;
};
export type GameResponse = {
  game: Game;
};
export type GameCreateRequest = {
  name: string;
  numberOfRounds: number;
  teamSize: number;
  tableSize: number;
};
export type GameUpdateRequest = {
  name: string;
  numberOfRounds: number;
  teamSize: number;
  tableSize: number;
  status: 'setup' | 'in_progress' | 'completed';
};
export type TeamResponse = {
  team: Team;
};
export type PlayersRequest = {
  name: string;
};
export type TeamsRequest = {
  name: string;
  players?: PlayersRequest[];
};
export type PlayersResponse = {
  player: Player;
};
export type TablesResponse = {
  tables: Table[];
};
export type ScoresRequest = {
  scores: {
    playerID: number;
    score: number;
  }[];
};
export const {
  useLivenessCheckQuery,
  useReadinessCheckQuery,
  useGetGamesQuery,
  useCreateGameMutation,
  useGetGameQuery,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useSetupGameMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useGetTablesQuery,
  useGetTableQuery,
  useUpdateScoresMutation,
} = injectedRtkApi;
