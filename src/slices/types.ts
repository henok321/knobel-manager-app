export type GameStatus = 'in_progress' | 'setup' | 'completed';

export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: GameStatus;
  teams: number[];
  rounds: number[];
  owners: string[];
};

export type Team = {
  id: number;
  name: string;
  gameID: number;
  players: number[];
};

export type Player = {
  id: number;
  name: string;
  teamID: number;
};

type Round = {
  id: number;
  roundNumber: number;
  gameID: number;
  status: string;
  tables: number[];
};

type Table = {
  id: number;
  tableNumber: number;
  roundID: number;
  players: number[];
};

type Score = {
  id: number;
  playerID: number;
  tableID: number;
  score: number;
};

export interface NormalizedData {
  games: Record<number, Game>;
  teams: Record<number, Team>;
  players: Record<number, Player>;
  rounds: Record<number, Round>;
  tables: Record<number, Table>;
  scores: Record<number, Score>;
}
