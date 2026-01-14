import { Badge, type MantineSize } from '@mantine/core';
import { IconCheck, IconPlayerPlay, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { GameStatus } from '../slices/types';

interface StatusBadgeProps {
  status: GameStatus;
  size?: MantineSize;
  variant?: 'dot' | 'light' | 'filled' | 'outline';
  withIcon?: boolean;
}

const getStatusConfig = (status: GameStatus) => {
  switch (status) {
    case 'setup':
      return {
        color: 'knobelWarning',
        icon: IconSettings,
        ariaLabel: 'status.setup.aria',
      };
    case 'in_progress':
      return {
        color: 'knobelPrimary',
        icon: IconPlayerPlay,
        ariaLabel: 'status.in_progress.aria',
      };
    case 'completed':
      return {
        color: 'knobelSuccess',
        icon: IconCheck,
        ariaLabel: 'status.completed.aria',
      };
    default:
      return {
        color: 'gray',
        icon: IconSettings,
        ariaLabel: 'status.unknown.aria',
      };
  }
};

const StatusBadge = ({
  status,
  size = 'sm',
  variant = 'light',
  withIcon = true,
}: StatusBadgeProps) => {
  const { t } = useTranslation('gameDetail');
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const iconSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;

  return (
    <Badge
      aria-label={t(config.ariaLabel)}
      color={config.color}
      leftSection={withIcon ? <Icon size={iconSize} /> : undefined}
      size={size}
      variant={variant}
    >
      {t(`status.${status}`)}
    </Badge>
  );
};

export default StatusBadge;
