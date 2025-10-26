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
import { useSelector } from 'react-redux';

import { GameStatusEnum, GameUpdateRequest } from '../generated';
import RankingsPanel from '../pages/games/panels/RankingsPanel';
import RoundsPanel from '../pages/games/panels/RoundsPanel';
import TeamsPanel from '../pages/games/panels/TeamsPanel';
import useGames from '../slices/games/hooks';
import { tablesSelectors } from '../slices/tables/slice';
import { Game } from '../slices/types';

const PrintMenu = lazy(() => import('./PrintMenu'));

interface GameViewContentProps {
  game: Game;
}

const GameViewContent = ({ game }: GameViewContentProps) => {
  const { t } = useTranslation();
  const { updateGame } = useGames();
  const allTables = useSelector(tablesSelectors.selectAll);

  // Get default tab based on game status
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

  // Load persisted tab from localStorage, fallback to status-based default
  const getPersistedTab = () => {
    try {
      const stored = localStorage.getItem(`gameTab_${game.id}`);
      return stored || getDefaultTab();
    } catch {
      return getDefaultTab();
    }
  };

  const [activeTab, setActiveTab] = useState<string | null>(getPersistedTab());

  // Persist tab changes to localStorage
  useEffect(() => {
    if (activeTab) {
      try {
        localStorage.setItem(`gameTab_${game.id}`, activeTab);
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }, [activeTab, game.id]);

  // Check if all scores are entered and calculate progress
  const scoreProgress = useMemo(() => {
    if (!game || game.status !== GameStatusEnum.InProgress) {
      return { canComplete: false, completed: 0, total: 0 };
    }

    const tablesByRound: Record<number, typeof allTables> = {};
    for (const table of allTables) {
      tablesByRound[table.roundID] ??= [];
      tablesByRound[table.roundID]?.push(table);
    }

    let completedTables = 0;
    let totalTables = 0;

    for (let roundNum = 1; roundNum <= game.numberOfRounds; roundNum++) {
      const tablesForRound = tablesByRound[roundNum];

      if (!tablesForRound || tablesForRound.length === 0) {
        continue;
      }

      for (const table of tablesForRound) {
        if (!table.players || table.players.length === 0) {
          continue;
        }

        totalTables++;
        const playerCount = table.players.length;
        const scoreCount = table.scores?.length || 0;

        if (scoreCount === playerCount) {
          completedTables++;
        }
      }
    }

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
      title: t('pages.gameDetail.actions.startGame'),
      children: (
        <Stack gap="sm">
          <Text size="sm">
            {t('pages.gameDetail.actions.startGameConfirmation')}
          </Text>
          <Text component="ul" ml="md" size="sm">
            <li>{t('pages.gameDetail.actions.startGameWarning1')}</li>
            <li>{t('pages.gameDetail.actions.startGameWarning2')}</li>
            <li>{t('pages.gameDetail.actions.startGameWarning3')}</li>
          </Text>
        </Stack>
      ),
      labels: {
        confirm: t('pages.gameDetail.actions.startGame'),
        cancel: t('global.cancel'),
      },
      confirmProps: { color: 'blue' },
      onConfirm: () => {
        handleStatusTransition(GameStatusEnum.InProgress);
        setActiveTab('rounds');
        notifications.show({
          title: t('pages.gameDetail.actions.gameStartedNotification'),
          message: t('pages.gameDetail.actions.gameStartedMessage'),
          color: 'blue',
        });
      },
    });
  };

  const confirmCompleteGame = () => {
    modals.openConfirmModal({
      title: t('pages.gameDetail.actions.completeGame'),
      children: (
        <Text size="sm">
          {t('pages.gameDetail.actions.completeGameConfirmation')}
        </Text>
      ),
      labels: {
        confirm: t('pages.gameDetail.actions.completeGame'),
        cancel: t('global.cancel'),
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
              {t('pages.gameDetail.teamSize')}: {game.teamSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('pages.gameDetail.tableSize')}: {game.tableSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('pages.gameDetail.rounds.round')}: {game.numberOfRounds}
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
            {t(`pages.gameDetail.status.${game.status}`)}
          </Badge>
          {game.status === GameStatusEnum.Setup && (
            <Button color="blue" size="sm" onClick={confirmStartGame}>
              {t('pages.gameDetail.actions.startGame')}
            </Button>
          )}
          {game.status === GameStatusEnum.InProgress && (
            <Tooltip
              disabled={canComplete}
              label={
                canComplete
                  ? undefined
                  : t('pages.gameDetail.actions.scoreProgress', {
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
                {t('pages.gameDetail.actions.completeGame')}
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
              <Tabs.Tab value="teams">
                {t('pages.gameDetail.tabs.teams')}
              </Tabs.Tab>
              <Tabs.Tab value="rounds">
                {t('pages.gameDetail.tabs.rounds')}
              </Tabs.Tab>
              <Tabs.Tab value="rankings">
                {t('pages.gameDetail.tabs.rankings')}
              </Tabs.Tab>
            </>
          )}
          {game.status === GameStatusEnum.InProgress && (
            <>
              <Tabs.Tab value="rounds">
                {t('pages.gameDetail.tabs.rounds')}
              </Tabs.Tab>
              <Tabs.Tab value="rankings">
                {t('pages.gameDetail.tabs.rankings')}
              </Tabs.Tab>
              <Tabs.Tab value="teams">
                {t('pages.gameDetail.tabs.teams')}
              </Tabs.Tab>
            </>
          )}
          {game.status === GameStatusEnum.Completed && (
            <>
              <Tabs.Tab value="rankings">
                {t('pages.gameDetail.tabs.rankings')}
              </Tabs.Tab>
              <Tabs.Tab value="rounds">
                {t('pages.gameDetail.tabs.rounds')}
              </Tabs.Tab>
              <Tabs.Tab value="teams">
                {t('pages.gameDetail.tabs.teams')}
              </Tabs.Tab>
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
