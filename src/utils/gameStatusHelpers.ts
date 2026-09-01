import type { TFunction } from 'i18next';
import type { GameStatus } from '../store/api.gen.ts';
import { assertNever } from './assertNever.ts';

const GAME_STATUSES: readonly GameStatus[] = [
  'setup',
  'in_progress',
  'completed',
];

export const isGameStatus = (value: string): value is GameStatus =>
  (GAME_STATUSES as readonly string[]).includes(value);

export const statusColor = (status: GameStatus): string => {
  switch (status) {
    case 'setup':
      return 'gray';
    case 'in_progress':
      return 'cobalt';
    case 'completed':
      return 'green';
    default:
      return assertNever(status);
  }
};

export const translateGameStatus = (
  t: TFunction,
  status: GameStatus,
): string => {
  switch (status) {
    case 'in_progress':
      return t('gameDetail:status.in_progress');
    case 'completed':
      return t('gameDetail:status.completed');
    case 'setup':
      return t('gameDetail:status.setup');
    default:
      return assertNever(status);
  }
};
