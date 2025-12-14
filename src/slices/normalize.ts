import type {
  Game as ApiGame,
  Team as ApiTeam,
  GameResponse,
  TeamResponse,
} from '../generated';
import type { Game, Team } from './types';

export const normalizeGame = (apiGame: ApiGame): Game => ({
  id: apiGame.id,
  name: apiGame.name,
  teamSize: apiGame.teamSize,
  tableSize: apiGame.tableSize,
  numberOfRounds: apiGame.numberOfRounds,
  status: apiGame.status,
  teams: apiGame.teams?.map((team) => team.id) || [],
  rounds: apiGame.rounds?.map((round) => round.id) || [],
  owners: apiGame.owners.map((owner) => owner.ownerSub),
});

export const normalizeGameResponse = (response: GameResponse): Game =>
  normalizeGame(response.game);

const normalizeTeam = (apiTeam: ApiTeam): Team => ({
  id: apiTeam.id,
  name: apiTeam.name,
  gameID: apiTeam.gameID,
  players: apiTeam.players?.map((player) => player.id) || [],
});

export const normalizeTeamResponse = (response: TeamResponse): Team =>
  normalizeTeam(response.team);
