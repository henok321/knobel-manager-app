import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Game } from '../../../slices/types';
import {
  getStatusColor,
  getStatusIcon,
} from '../../../utils/gameStatusHelpers';

interface GameListItemProps {
  game: Game;
  isActive: boolean;
  onActivate: (gameId: number) => void;
  onDelete: (gameId: number) => void;
}

const GameListItem = ({
  game,
  isActive,
  onActivate,
  onDelete,
}: GameListItemProps) => {
  const { t } = useTranslation(['games', 'gameDetail', 'home', 'common']);
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    modals.openConfirmModal({
      title: t('deleteGame'),
      children: <Text size="sm">{t('confirmDelete')}</Text>,
      labels: {
        confirm: t('actions.delete'),
        cancel: t('actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onDelete(game.id);
      },
    });
  };

  const handleOpen = () => {
    onActivate(game.id);
    navigate(`/games/${game.id}`);
  };

  return (
    <Card withBorder padding="md" radius="md" shadow="sm">
      <Stack gap="sm">
        <Group align="center" justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
            {isActive && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-blue-6)',
                  flexShrink: 0,
                }}
              />
            )}
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text truncate fw={isActive ? 700 : 500} size="md">
                {game.name}
              </Text>
              <Group gap="xs">
                <Badge
                  color={getStatusColor(game.status)}
                  leftSection={getStatusIcon(game.status, 14)}
                  size="sm"
                  variant="light"
                >
                  {t(`status.${game.status}`, { ns: 'gameDetail' })}
                </Badge>
                <Text c="dimmed" size="xs">
                  {game.teams.length}{' '}
                  {t('picker.teams', { ns: 'home' }).toLowerCase()} •{' '}
                  {game.numberOfRounds}{' '}
                  {t('rounds.round', { ns: 'gameDetail' }).toLowerCase()}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Button size="sm" onClick={handleOpen}>
              {t('card.viewDetails')}
            </Button>
            <ActionIcon
              color="red"
              size="lg"
              variant="subtle"
              onClick={handleDelete}
            >
              <IconTrash style={{ width: 20, height: 20 }} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider />
        <Group gap="md">
          <div>
            <Text c="dimmed" size="xs">
              {t('card.details.teamSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.teamSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('card.details.tableSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.tableSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('card.details.numberOfRounds')}
            </Text>
            <Text fw={600} size="sm">
              {game.numberOfRounds}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('card.details.teams')}
            </Text>
            <Text fw={600} size="sm">
              {game.teams.length}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
};

export default React.memo(GameListItem);
