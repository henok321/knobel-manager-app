import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  EllipsisVerticalIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GameStatusEnum } from '../../../generated';
import { Game } from '../../../slices/types';

interface GameListItemProps {
  game: Game;
  isActive: boolean;
  onActivate: (gameId: number) => void;
  onDelete: (gameId: number) => void;
}

const getStatusIcon = (status: GameStatusEnum) => {
  switch (status) {
    case GameStatusEnum.Setup:
      return <CogIcon style={{ width: 14, height: 14 }} />;
    case GameStatusEnum.InProgress:
      return <PlayIcon style={{ width: 14, height: 14 }} />;
    case GameStatusEnum.Completed:
      return <CheckCircleIcon style={{ width: 14, height: 14 }} />;
    default:
      return null;
  }
};

const getStatusColor = (status: GameStatusEnum) => {
  switch (status) {
    case GameStatusEnum.Setup:
      return 'gray';
    case GameStatusEnum.InProgress:
      return 'blue';
    case GameStatusEnum.Completed:
      return 'green';
    default:
      return 'gray';
  }
};

const GameListItem = ({
  game,
  isActive,
  onActivate,
  onDelete,
}: GameListItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    if (confirm(t('pages.games.confirmDelete'))) {
      onDelete(game.id);
    }
  };

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      shadow="sm"
      style={{ cursor: 'pointer' }}
      onClick={() => setExpanded(!expanded)}
    >
      <Stack gap="sm">
        {/* Main Row */}
        <Group align="center" justify="space-between" wrap="nowrap">
          {/* Left: Active indicator + Name + Status */}
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
                  leftSection={getStatusIcon(game.status)}
                  size="sm"
                  variant="light"
                >
                  {t(`pages.gameDetail.status.${game.status}`)}
                </Badge>
                <Text c="dimmed" size="xs">
                  {game.teams.length}{' '}
                  {t('pages.home.picker.teams').toLowerCase()} •{' '}
                  {game.numberOfRounds}{' '}
                  {t('pages.gameDetail.rounds.round').toLowerCase()}
                </Text>
              </Group>
            </Stack>
          </Group>

          {/* Right: Actions */}
          <Group gap="xs" wrap="nowrap">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/games/${game.id}`);
              }}
            >
              {t('pages.games.card.viewDetails')}
            </Button>

            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon
                  color="gray"
                  size="lg"
                  variant="subtle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVerticalIcon style={{ width: 20, height: 20 }} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {!isActive && (
                  <>
                    <Menu.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivate(game.id);
                      }}
                    >
                      {t('pages.games.card.activateButton')}
                    </Menu.Item>
                    <Divider />
                  </>
                )}
                <Menu.Item
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  {t('pages.games.card.deleteButton')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <ActionIcon
              color="gray"
              size="sm"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronUpIcon style={{ width: 16, height: 16 }} />
              ) : (
                <ChevronDownIcon style={{ width: 16, height: 16 }} />
              )}
            </ActionIcon>
          </Group>
        </Group>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Divider mb="sm" />
          <Stack gap="xs">
            <Group gap="md">
              <div>
                <Text c="dimmed" size="xs">
                  {t('pages.games.card.details.teamSize')}
                </Text>
                <Text fw={600} size="sm">
                  {game.teamSize}
                </Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  {t('pages.games.card.details.tableSize')}
                </Text>
                <Text fw={600} size="sm">
                  {game.tableSize}
                </Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  {t('pages.games.card.details.numberOfRounds')}
                </Text>
                <Text fw={600} size="sm">
                  {game.numberOfRounds}
                </Text>
              </div>
              <div>
                <Text c="dimmed" size="xs">
                  {t('pages.games.card.details.teams')}
                </Text>
                <Text fw={600} size="sm">
                  {game.teams.length}
                </Text>
              </div>
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
};

export default GameListItem;
