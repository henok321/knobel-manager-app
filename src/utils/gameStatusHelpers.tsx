import { IconCheck, IconPlayerPlay, IconSettings } from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import type { GameStatus } from '../slices/types';

export const statusColor = (status: GameStatus): string => {
  switch (status) {
    case 'setup':
      return 'gray';
    case 'in_progress':
      return 'blue';
    case 'completed':
      return 'green';
    default:
      return 'gray';
  }
};

export const statusIcon = (status: GameStatus, size = 16) => {
  const style = { width: size, height: size };

  switch (status) {
    case 'setup':
      return <IconSettings style={style} />;
    case 'in_progress':
      return <IconPlayerPlay style={style} />;
    case 'completed':
      return <IconCheck style={style} />;
    default:
      return null;
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
  }
};
