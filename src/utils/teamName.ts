import type { Team } from '../store/api.gen.ts';

export const teamName = (teams: Team[], teamId: number): string =>
  teams.find((team) => team.id === teamId)?.name ?? '-';
