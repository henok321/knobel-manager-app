import {
  Badge,
  Button,
  Group,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlayerPlay, IconSettings } from '@tabler/icons-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GameStatusEnum, GameUpdateRequest } from '../generated';
import RankingsPanel from '../pages/games/panels/RankingsPanel';
import RoundsPanel from '../pages/games/panels/RoundsPanel';
import TeamsPanel from '../pages/games/panels/TeamsPanel';
import useGames from '../slices/games/hooks';
import useTables from '../slices/tables/hooks';
import { Game } from '../slices/types';

const PrintMenu = lazy(() => import('./PrintMenu'));

interface GameViewContentProps {
  game: Game;
}

const GameViewContent = ({ game }: GameViewContentProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { updateGame } = useGames();
  const { tables: allTables } = useTables();

  const getDefaultTab = () => {
    switch (game.status) {
      case GameStatusEnum.Setup:
        return 'teams';
      case GameStatusEnum.InProgress:
        return 'rounds';
      case GameStatusEnum.Completed:
        return 'rankings';
      default:
        return 'teams';
    }
  };

  const getPersistedTab = () => {
    try {
      const stored = localStorage.getItem(`selected_tab_for_game_${game.id}`);
      return stored || getDefaultTab();
    } catch {
      return getDefaultTab();
    }
  };

  const [activeTab, setActiveTab] = useState<string | null>(getPersistedTab());

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(`selected_tab_for_game_${game.id}`, activeTab);
    }
  }, [activeTab, game.id]);

  const scoreProgress = useMemo(() => {
    if (!game || game.status !== GameStatusEnum.InProgress) {
      return { canComplete: false, completed: 0, total: 0 };
    }

    const totalTables = allTables.length;

    const completedTables = allTables.reduce((acc, table) => {
      if (!table.players || table.players.length === 0) {
        return acc;
      }

      const totalTableScore =
        table.scores?.reduce((scoreAcc, score) => scoreAcc + score.score, 0) ||
        0;

      return totalTableScore > 0 ? acc + 1 : acc;
    }, 0);

    return {
      canComplete: completedTables === totalTables && totalTables > 0,
      completed: completedTables,
      total: totalTables,
    };
  }, [game, allTables]);

  const canComplete = scoreProgress.canComplete;

  const handleStatusTransition = (newStatus: GameStatusEnum) => {
    const gameRequest: GameUpdateRequest = {
      name: game.name,
      numberOfRounds: game.numberOfRounds,
      teamSize: game.teamSize,
      tableSize: game.tableSize,
      status: newStatus,
    };
    updateGame(game.id, gameRequest);
  };

  const confirmStartGame = () => {
    modals.openConfirmModal({
      title: t('actions.startGame'),
      children: (
        <Stack gap="sm">
          <Text size="sm">{t('actions.startGameConfirmation')}</Text>
          <Text component="ul" ml="md" size="sm">
            <li>{t('actions.startGameWarning1')}</li>
            <li>{t('actions.startGameWarning2')}</li>
            <li>{t('actions.startGameWarning3')}</li>
          </Text>
        </Stack>
      ),
      labels: {
        confirm: t('actions.startGame'),
        cancel: t('actions.cancel'),
      },
      confirmProps: { color: 'blue' },
      onConfirm: () => {
        handleStatusTransition(GameStatusEnum.InProgress);
        setActiveTab('rounds');
        notifications.show({
          title: t('actions.gameStartedNotification'),
          message: t('actions.gameStartedMessage'),
          color: 'blue',
        });
      },
    });
  };

  const confirmCompleteGame = () => {
    modals.openConfirmModal({
      title: t('actions.completeGame'),
      children: <Text size="sm">{t('actions.completeGameConfirmation')}</Text>,
      labels: {
        confirm: t('actions.completeGame'),
        cancel: t('actions.cancel'),
      },
      confirmProps: { color: 'green' },
      onConfirm: () => handleStatusTransition(GameStatusEnum.Completed),
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'setup':
        return <IconSettings style={{ width: 16, height: 16 }} />;
      case 'in_progress':
        return <IconPlayerPlay style={{ width: 16, height: 16 }} />;
      case 'completed':
        return <IconCheck style={{ width: 16, height: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <Stack gap="md">
      {/* Game Header */}
      <Group align="center" justify="space-between">
        <div>
          <Title order={1}>{game.name}</Title>
          <Group gap="xs" mt="xs">
            <Text c="dimmed" size="sm">
              {t('teamSize')}: {game.teamSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('tableSize')}: {game.tableSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('numberOfRounds')}: {game.numberOfRounds}
            </Text>
          </Group>
        </div>
        <Group gap="sm">
          <Badge
            color={getStatusColor(game.status)}
            leftSection={getStatusIcon(game.status)}
            size="lg"
            variant="filled"
          >
            {t(`status.${game.status}`)}
          </Badge>
          {game.status === GameStatusEnum.Setup && (
            <Button color="blue" size="sm" onClick={confirmStartGame}>
              {t('actions.startGame')}
            </Button>
          )}
          {game.status === GameStatusEnum.InProgress && (
            <Tooltip
              disabled={canComplete}
              label={
                canComplete
                  ? undefined
                  : t('actions.scoreProgress', {
                      completed: scoreProgress.completed,
                      total: scoreProgress.total,
                    })
              }
            >
              <Button
                color="green"
                disabled={!canComplete}
                size="sm"
                onClick={confirmCompleteGame}
              >
                {t('actions.completeGame')}
              </Button>
            </Tooltip>
          )}
          <Suspense fallback={<Skeleton height={36} width={120} />}>
            <PrintMenu game={game} />
          </Suspense>
        </Group>
      </Group>

      {/* Tabs - Order changes based on game status */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          {game.status === GameStatusEnum.Setup && (
            <>
              <Tabs.Tab value="teams">{t('tabs.teams')}</Tabs.Tab>
              <Tabs.Tab value="rounds">{t('tabs.rounds')}</Tabs.Tab>
              <Tabs.Tab value="rankings">{t('tabs.rankings')}</Tabs.Tab>
            </>
          )}
          {game.status === GameStatusEnum.InProgress && (
            <>
              <Tabs.Tab value="rounds">{t('tabs.rounds')}</Tabs.Tab>
              <Tabs.Tab value="rankings">{t('tabs.rankings')}</Tabs.Tab>
              <Tabs.Tab value="teams">{t('tabs.teams')}</Tabs.Tab>
            </>
          )}
          {game.status === GameStatusEnum.Completed && (
            <>
              <Tabs.Tab value="rankings">{t('tabs.rankings')}</Tabs.Tab>
              <Tabs.Tab value="rounds">{t('tabs.rounds')}</Tabs.Tab>
              <Tabs.Tab value="teams">{t('tabs.teams')}</Tabs.Tab>
            </>
          )}
        </Tabs.List>

        <Tabs.Panel pt="md" value="teams">
          <TeamsPanel game={game} />
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="rounds">
          <RoundsPanel game={game} />
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="rankings">
          <RankingsPanel game={game} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default GameViewContent;
