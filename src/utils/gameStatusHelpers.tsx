import type { TFunction } from 'i18next';
import type { GameStatus } from '../slices/types';
import { assertNever } from './assertNever';

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
