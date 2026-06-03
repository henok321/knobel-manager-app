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
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/Icon';
import type { Game } from '../../../store/generatedApi.ts';
import {
  statusColor,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';

interface GameListItemProps {
  game: Game;
  onDelete: (gameID: number) => void;
}

const GameListItem = ({ game, onDelete }: GameListItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    modals.openConfirmModal({
      title: t('games:deleteGame'),
      children: <Text size="sm">{t('games:confirmDelete')}</Text>,
      labels: {
        confirm: t('common:actions.delete'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onDelete(game.id);
      },
    });
  };

  const handleOpen = () => {
    void navigate(`/games/${game.id}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <Card
      className="km-card-interactive"
      padding="md"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleCardKeyDown}
    >
      <Stack gap="sm">
        <Group align="center" justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text truncate fw={600} size="lg">
                {game.name}
              </Text>
              <Group gap="xs">
                <Badge
                  size="sm"
                  variant="filled"
                  color={statusColor(game.status)}
                >
                  {translateGameStatus(t, game.status)}
                </Badge>
                <Text c="dimmed" size="xs">
                  {game.teams?.length ?? 0}{' '}
                  {t('games:picker.teams').toLowerCase()} •{' '}
                  {game.numberOfRounds}{' '}
                  {t('gameDetail:rounds.round').toLowerCase()}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpen();
              }}
            >
              {t('games:card.viewDetails')}
            </Button>
            <ActionIcon
              aria-label={t('common:actions.delete')}
              color="gray"
              size="lg"
              onClick={handleDelete}
            >
              <Icon icon={IconTrash} size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider />
        <Group gap="md">
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.teamSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.teamSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.tableSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.tableSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.numberOfRounds')}
            </Text>
            <Text fw={600} size="sm">
              {game.numberOfRounds}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.teams')}
            </Text>
            <Text fw={600} size="sm">
              {game.teams?.length ?? 0}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
};

export default GameListItem;
