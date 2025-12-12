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
import type { GameStatus as GameStatusType } from '../../../generated';
import useGames from '../../../slices/games/hooks.ts';
import useTables from '../../../slices/tables/hooks.ts';
import { Game } from '../../../slices/types.ts';
import {
  getStatusColor,
  getStatusIcon,
} from '../../../utils/gameStatusHelpers';
import RankingsPanel from '../panels/RankingsPanel.tsx';
import RoundsPanel from '../panels/RoundsPanel.tsx';
import TeamsPanel from '../panels/TeamsPanel.tsx';

const PrintMenu = lazy(
  () => import('../../../header/components/PrintMenu.tsx'),
);

interface GameViewContentProps {
  game: Game;
}

const GameViewContent = ({ game }: GameViewContentProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const { updateGame } = useGames();
  const { tables: allTables } = useTables();

  const getDefaultTab = () => {
    switch (game.status) {
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
        handleStatusTransition('in_progress');
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
          {game.status === 'setup' && (
            <Button color="blue" size="sm" onClick={confirmStartGame}>
              {t('actions.startGame')}
            </Button>
          )}
          {game.status === 'in_progress' && (
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

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          {game.status === 'setup' && (
            <>
              <Tabs.Tab value="teams">{t('tabs.teams')}</Tabs.Tab>
              <Tabs.Tab value="rounds">{t('tabs.rounds')}</Tabs.Tab>
              <Tabs.Tab value="rankings">{t('tabs.rankings')}</Tabs.Tab>
            </>
          )}
          {game.status === 'in_progress' && (
            <>
              <Tabs.Tab value="rounds">{t('tabs.rounds')}</Tabs.Tab>
              <Tabs.Tab value="rankings">{t('tabs.rankings')}</Tabs.Tab>
              <Tabs.Tab value="teams">{t('tabs.teams')}</Tabs.Tab>
            </>
          )}
          {game.status === 'completed' && (
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
