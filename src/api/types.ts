// Re-export generated types
export type {
  Game,
  GameCreateRequest,
  GameUpdateRequest,
  GameResponse,
  GamesResponse,
  Team,
  TeamResponse,
  TeamsRequest,
  Player,
  PlayersRequest,
  PlayersResponse,
  Table,
  TablesResponse,
  Score,
  ScoresRequest,
} from '../generated/api';

// Game status type and enum for compatibility
export type GameStatus = 'setup' | 'in_progress' | 'completed';

export const GameStatusEnum = {
  Setup: 'setup' as const,
  InProgress: 'in_progress' as const,
  Completed: 'completed' as const,
};
