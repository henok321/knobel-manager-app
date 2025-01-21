export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: string;
  owners: Owner[];
};

export type Owner = {
  gameID: number;
  ownerSub: string;
};

export type Team = {
  id: number;
  name: string;
  gameID: number;
};

export type Player = {
  id: number;
  name: string;
  teamID: number;
};

export type Round = {
  id: number;
  roundNumber: number;
  gameID: number;
  status: string;
};

export type Table = {
  id: number;
  tableNumber: number;
  roundID: number;
};

export type Score = {
  id: number;
  playerID: number;
  tableID: number;
  score: number;
};

export interface NormalizedData {
  activeGameID?: number;
  games: Record<number, Game>;
  teams: Record<number, Team>;
  players: Record<number, Player>;
  rounds: Record<number, Round>;
  tables: Record<number, Table>;
  scores: Record<number, Score>;
}
