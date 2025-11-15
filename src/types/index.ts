export type Game = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: 'in_progress' | 'setup' | 'completed';
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
