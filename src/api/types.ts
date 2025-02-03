export type GamesResponse = {
  games: ApiGame[];
  activeGameID: number;
};

export type GameRequest = {
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
};

export type GameResponse = {
  game: ApiGame;
};

export type TeamRequest = {
  name: string;
};

export type TeamResponse = {
  team: ApiTeam;
};

export type PlayerRequest = {
  name: string;
};

export type PlayerResponse = {
  player: ApiPlayer;
};

export type ApiGame = {
  id: number;
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
  status: string;
  owners: ApiOwner[];
  teams?: ApiTeam[];
  rounds?: ApiRound[];
};

export type ApiOwner = {
  gameID: number;
  ownerSub: string;
};

export type ApiTeam = {
  id: number;
  name: string;
  gameID: number;
  players?: ApiPlayer[];
};

export type ApiPlayer = {
  id: number;
  name: string;
  teamID: number;
};

export type ApiRound = {
  id: number;
  roundNumber: number;
  gameID: number;
  status: string;
  tables?: ApiTable[];
};

export type ApiTable = {
  id: number;
  tableNumber: number;
  roundID: number;
  players: ApiPlayer[];
  scores?: ApiScore[];
};

export type ApiScore = {
  id: number;
  playerID: number;
  tableID: number;
  score: number;
};
