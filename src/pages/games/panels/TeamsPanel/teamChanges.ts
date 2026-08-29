import type { Team } from '../../../../store/generatedApi.ts';

export interface PlayerName {
  id: number;
  name: string;
}

export interface TeamChanges {
  nameChanged: boolean;
  renamedPlayers: PlayerName[];
}

export const teamChanges = (
  team: Team,
  teamName: string,
  players: PlayerName[],
): TeamChanges => ({
  nameChanged: teamName !== team.name,
  renamedPlayers: players.filter(
    (player) =>
      player.name !==
      team.players?.find((current) => current.id === player.id)?.name,
  ),
});
