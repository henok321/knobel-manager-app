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
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type GameUpdateRequest } from '../../../generated';
import useGames from '../../../slices/games/hooks.ts';
import useTables from '../../../slices/tables/hooks.ts';
import {
  Game,
  GameStatus,
  GameStatus as GameStatusType,
} from '../../../slices/types.ts';
import {
  getStatusColor,
  getStatusIcon,
} from '../../../utils/gameStatusHelpers';
import RankingsPanel from '../panels/RankingsPanel.tsx';
import RoundsPanel from '../panels/RoundsPanel.tsx';
import TeamsPanel from '../panels/TeamsPanel.tsx';

const PrintMenu = lazy(() => import('../../../shared/PrintMenu.tsx'));

interface GameViewContentProps {
  game: Game;
}
type GameTab = 'teams' | 'rounds' | 'rankings';

const getDefaultTab = (status: GameStatus): GameTab => {
  switch (status) {
    case 'setup':
      return 'teams';
    case 'in_progress':
      return 'rounds';
    case 'completed':
      return 'rankings';
    default:
      return 'teams';
  }
};

const GameViewContent = ({ game }: GameViewContentProps) => {
  const { t } = useTranslation();
  const { updateGame } = useGames();
  const { tables: allTables } = useTables();

  const getPersistedTab = (): GameTab => {
    try {
      const stored = localStorage.getItem(
        `selected_tab_for_game_${game.id}`,
      ) as GameTab | null;
      return stored || getDefaultTab(game.status);
    } catch {
      return getDefaultTab(game.status);
    }
  };

  const [activeTab, setActiveTab] = useState<GameTab | null>(getPersistedTab());

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(`selected_tab_for_game_${game.id}`, activeTab);
    }
  }, [activeTab, game.id]);

  const scoreProgress = useMemo(() => {
    if (!game || game.status !== 'in_progress') {
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

  const handleStatusTransition = (newStatus: GameStatusType) => {
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
      title: t('gameDetail:actions.startGame'),
      children: (
        <Stack gap="sm">
          <Text size="sm">{t('gameDetail:actions.startGameConfirmation')}</Text>
          <Text component="ul" ml="md" size="sm">
            <li>{t('gameDetail:actions.startGameWarning1')}</li>
            <li>{t('gameDetail:actions.startGameWarning2')}</li>
            <li>{t('gameDetail:actions.startGameWarning3')}</li>
          </Text>
        </Stack>
      ),
      labels: {
        confirm: t('gameDetail:actions.startGame'),
        cancel: t('gameDetail:actions.cancel'),
      },
      confirmProps: { color: 'blue' },
      onConfirm: () => {
        handleStatusTransition('in_progress');
        setActiveTab('rounds');
        notifications.show({
          title: t('gameDetail:actions.gameStartedNotification'),
          message: t('gameDetail:actions.gameStartedMessage'),
          color: 'blue',
        });
      },
    });
  };

  const confirmCompleteGame = () => {
    modals.openConfirmModal({
      title: t('gameDetail:actions.completeGame'),
      children: (
        <Text size="sm">
          {t('gameDetail:actions.completeGameConfirmation')}
        </Text>
      ),
      labels: {
        confirm: t('gameDetail:actions.completeGame'),
        cancel: t('gameDetail:actions.cancel'),
      },
      confirmProps: { color: 'green' },
      onConfirm: () => handleStatusTransition('completed'),
    });
  };

  return (
    <Stack gap="md">
      <Group align="center" justify="space-between">
        <div>
          <Title order={1}>{game.name}</Title>
          <Group gap="xs" mt="xs">
            <Text c="dimmed" size="sm">
              {t('gameDetail:teamSize')}: {game.teamSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('gameDetail:tableSize')}: {game.tableSize}
            </Text>
            <Text c="dimmed">•</Text>
            <Text c="dimmed" size="sm">
              {t('gameDetail:numberOfRounds')}: {game.numberOfRounds}
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
            {t(`gameDetail:status.${game.status}`)}
          </Badge>
          {game.status === 'setup' && (
            <Button color="blue" size="sm" onClick={confirmStartGame}>
              {t('gameDetail:actions.startGame')}
            </Button>
          )}
          {game.status === 'in_progress' && (
            <Tooltip
              disabled={canComplete}
              label={
                canComplete
                  ? undefined
                  : t('gameDetail:actions.scoreProgress', {
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
                {t('gameDetail:actions.completeGame')}
              </Button>
            </Tooltip>
          )}
          <Suspense fallback={<Skeleton height={36} width={120} />}>
            <PrintMenu game={game} />
          </Suspense>
        </Group>
      </Group>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as GameTab)}
      >
        <Tabs.List>
          <>
            <Tabs.Tab value="teams">{t('gameDetail:tabs.teams')}</Tabs.Tab>
            <Tabs.Tab value="rounds">{t('gameDetail:tabs.rounds')}</Tabs.Tab>
            <Tabs.Tab value="rankings">
              {t('gameDetail:tabs.rankings')}
            </Tabs.Tab>
          </>
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
