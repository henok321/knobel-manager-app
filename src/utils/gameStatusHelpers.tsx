import { IconCheck, IconPlayerPlay, IconSettings } from '@tabler/icons-react';

import type { GameStatus } from '../slices/types';

export const getStatusColor = (status: GameStatus): string => {
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

export const getStatusIcon = (status: GameStatus, size = 16) => {
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
