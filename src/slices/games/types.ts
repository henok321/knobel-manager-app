export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: string;
  owners: Owner[];
  teams: Team[];
  rounds: Round[];
};

export type Owner = {
  gameID: number;
  ownerSub: string;
};

export type Team = {
  id: number;
  name: string;
  gameID: number;
  players: Player[];
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
  tables: Table[];
};

export type Table = {
  id: number;
  tableNumber: number;
  roundID: number;
  players: Player[];
  scores?: Score[];
};

export type Score = {
  id: number;
  playerID: number;
  tableID: number;
  score: number;
};
