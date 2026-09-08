import type { Team } from '../store/api.gen.ts';

export const teamName = (teams: Team[], teamID: number): string =>
  teams.find((team) => team.id === teamID)?.name ?? '-';
