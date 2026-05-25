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

import type { GameUpdateRequest } from '../../../generated';
import useGames from '../../../slices/games/hooks.ts';
import { useTablesByGameId } from '../../../slices/tables/hooks.ts';
import type { Game, GameStatus } from '../../../slices/types.ts';
import { assertNever } from '../../../utils/assertNever';
import {
  statusColor,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';
import RankingsPanel from '../panels/RankingsPanel.tsx';
import RoundsPanel from '../panels/RoundsPanel.tsx';
import TeamsPanel from '../panels/TeamsPanel.tsx';

const PrintMenu = lazy(() => import('../../../shared/PrintMenu.tsx'));

interface GameViewContentProps {
  game: Game;
}

const GAME_TYPES = ['teams', 'rounds', 'rankings'] as const;

type GameTab = (typeof GAME_TYPES)[number];

const isGameTab = (tab: string): tab is GameTab =>
  (GAME_TYPES as readonly string[]).includes(tab);

const getDefaultTab = (status: GameStatus): GameTab => {
  switch (status) {
    case 'setup':
      return 'teams';
    case 'in_progress':
      return 'rounds';
    case 'completed':
      return 'rankings';
    default:
      return assertNever(status);
  }
};

const GameViewContent = ({ game }: GameViewContentProps) => {
  const { t } = useTranslation();
  const { updateGame } = useGames();
  const tables = useTablesByGameId(game.id);

  const getPersistedTab = (): GameTab => {
    const stored = localStorage.getItem(`selected_tab_for_game_${game.id}`);
    return !stored || !isGameTab(stored) ? getDefaultTab(game.status) : stored;
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

    const totalTables = tables.length;

    const completedTables = tables.reduce((acc, table) => {
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
  }, [game, tables]);

  const canComplete = scoreProgress.canComplete;

  const sufficientTeams = game.teamSize <= game.teams.length;
  const sufficientRounds = game.rounds.length === game.numberOfRounds;

  const handleStatusTransition = (newStatus: GameStatus) => {
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
      confirmProps: { color: 'cobalt' },
      onConfirm: () => {
        handleStatusTransition('in_progress');
        setActiveTab('rounds');
        notifications.show({
          title: t('gameDetail:actions.gameStartedNotification'),
          message: t('gameDetail:actions.gameStartedMessage'),
          color: 'cobalt',
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
      confirmProps: { color: 'red' },
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
          <Badge color={statusColor(game.status)} size="lg" variant="filled">
            {translateGameStatus(t, game.status)}
          </Badge>
          {game.status === 'setup' && sufficientTeams && sufficientRounds && (
            <Button color="cobalt" size="sm" onClick={confirmStartGame}>
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
                color="red"
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
        onChange={(value) => {
          if (!(value && isGameTab(value))) {
            return;
          }
          setActiveTab(value);
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="teams">{t('gameDetail:tabs.teams')}</Tabs.Tab>
          <Tabs.Tab value="rounds">{t('gameDetail:tabs.rounds')}</Tabs.Tab>
          <Tabs.Tab value="rankings">{t('gameDetail:tabs.rankings')}</Tabs.Tab>
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
