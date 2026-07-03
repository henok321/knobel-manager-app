import { baseApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    livenessCheck: build.query<LivenessCheckApiResponse, LivenessCheckApiArg>({
      query: () => ({ url: `/health/live` }),
    }),
    readinessCheck: build.query<
      ReadinessCheckApiResponse,
      ReadinessCheckApiArg
    >({
      query: () => ({ url: `/health/ready` }),
    }),
    getGames: build.query<GetGamesApiResponse, GetGamesApiArg>({
      query: () => ({ url: `/games` }),
    }),
    createGame: build.mutation<CreateGameApiResponse, CreateGameApiArg>({
      query: (queryArg) => ({
        url: `/games`,
        method: "POST",
        body: queryArg.gameCreateRequest,
      }),
    }),
    getGame: build.query<GetGameApiResponse, GetGameApiArg>({
      query: (queryArg) => ({ url: `/games/${queryArg.gameId}` }),
    }),
    updateGame: build.mutation<UpdateGameApiResponse, UpdateGameApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}`,
        method: "PUT",
        body: queryArg.gameUpdateRequest,
      }),
    }),
    deleteGame: build.mutation<DeleteGameApiResponse, DeleteGameApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}`,
        method: "DELETE",
      }),
    }),
    setupGame: build.mutation<SetupGameApiResponse, SetupGameApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/setup`,
        method: "POST",
      }),
    }),
    addOwner: build.mutation<AddOwnerApiResponse, AddOwnerApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/owners`,
        method: "POST",
        body: queryArg.addOwnerRequest,
      }),
    }),
    removeOwner: build.mutation<RemoveOwnerApiResponse, RemoveOwnerApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/owners/${queryArg.ownerSub}`,
        method: "DELETE",
      }),
    }),
    createTeam: build.mutation<CreateTeamApiResponse, CreateTeamApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams`,
        method: "POST",
        body: queryArg.teamsRequest,
      }),
    }),
    updateTeam: build.mutation<UpdateTeamApiResponse, UpdateTeamApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}`,
        method: "PUT",
        body: queryArg.teamsRequest,
      }),
    }),
    deleteTeam: build.mutation<DeleteTeamApiResponse, DeleteTeamApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}`,
        method: "DELETE",
      }),
    }),
    createPlayer: build.mutation<CreatePlayerApiResponse, CreatePlayerApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players`,
        method: "POST",
        body: queryArg.playersRequest,
      }),
    }),
    updatePlayer: build.mutation<UpdatePlayerApiResponse, UpdatePlayerApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players/${queryArg.playerId}`,
        method: "PUT",
        body: queryArg.playersRequest,
      }),
    }),
    deletePlayer: build.mutation<DeletePlayerApiResponse, DeletePlayerApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/teams/${queryArg.teamId}/players/${queryArg.playerId}`,
        method: "DELETE",
      }),
    }),
    getGameTables: build.query<GetGameTablesApiResponse, GetGameTablesApiArg>({
      query: (queryArg) => ({ url: `/games/${queryArg.gameId}/tables` }),
    }),
    getTables: build.query<GetTablesApiResponse, GetTablesApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables`,
      }),
    }),
    getTable: build.query<GetTableApiResponse, GetTableApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables/${queryArg.tableNumber}`,
      }),
    }),
    updateScores: build.mutation<UpdateScoresApiResponse, UpdateScoresApiArg>({
      query: (queryArg) => ({
        url: `/games/${queryArg.gameId}/rounds/${queryArg.roundNumber}/tables/${queryArg.tableNumber}/scores`,
        method: "PUT",
        body: queryArg.scoresRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type LivenessCheckApiResponse =
  /** status 200 Process is alive */ HealthCheckResponse;
export type LivenessCheckApiArg = void;
export type ReadinessCheckApiResponse =
  /** status 200 Service is ready to serve traffic (status "pass") */ HealthCheckDetailedResponse;
export type ReadinessCheckApiArg = void;
export type GetGamesApiResponse =
  /** status 200 Games list (can be empty) */ GamesResponse;
export type GetGamesApiArg = void;
export type CreateGameApiResponse = /** status 201 Game created */ GameResponse;
export type CreateGameApiArg = {
  gameCreateRequest: GameCreateRequest;
};
export type GetGameApiResponse = /** status 200 Game found */ GameResponse;
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
export type AddOwnerApiResponse =
  /** status 200 Owner added; updated game returned */ GameResponse;
export type AddOwnerApiArg = {
  gameId: number;
  addOwnerRequest: AddOwnerRequest;
};
export type RemoveOwnerApiResponse =
  /** status 200 Owner removed; updated game returned */ GameResponse;
export type RemoveOwnerApiArg = {
  gameId: number;
  ownerSub: string;
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
export type GetGameTablesApiResponse =
  /** status 200 Tables found */ TablesResponse;
export type GetGameTablesApiArg = {
  gameId: number;
};
export type GetTablesApiResponse =
  /** status 200 Tables found */ TablesResponse;
export type GetTablesApiArg = {
  gameId: number;
  roundNumber: number;
};
export type GetTableApiResponse = /** status 200 Table found */ TableResponse;
export type GetTableApiArg = {
  gameId: number;
  roundNumber: number;
  tableNumber: number;
};
export type UpdateScoresApiResponse =
  /** status 200 Updated table with new scores */ TableResponse;
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
  status: "pass" | "fail";
  checks?: {
    [key: string]: {
      status: "pass" | "fail";
      message?: string;
    };
  };
};
export type GameStatus = "setup" | "in_progress" | "completed";
export type GameOwner = {
  gameID: number;
  ownerSub: string;
  /** Resolved live from Firebase; absent if the user cannot be resolved. */
  email?: string;
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
export type RoundStatus = "setup" | "in_progress" | "completed";
export type GameRound = {
  id: number;
  gameID: number;
  roundNumber: number;
  status: RoundStatus;
};
export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: GameStatus;
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
  status: GameStatus;
};
export type AddOwnerRequest = {
  email: string;
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
export type TablesResponse = {
  tables: Table[];
};
export type TableResponse = {
  table: Table;
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
  useAddOwnerMutation,
  useRemoveOwnerMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useGetGameTablesQuery,
  useGetTablesQuery,
  useGetTableQuery,
  useUpdateScoresMutation,
} = injectedRtkApi;
