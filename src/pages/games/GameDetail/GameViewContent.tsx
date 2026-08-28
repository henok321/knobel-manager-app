import {
  Badge,
  Button,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrintMenu from '../../../shared/PrintMenu.tsx';
import {
  useGetGameTablesQuery,
  useUpdateGameMutation,
} from '../../../store/api.ts';
import type {
  Game,
  GameStatus,
  GameUpdateRequest,
} from '../../../store/generatedApi.ts';
import { assertNever } from '../../../utils/assertNever';
import {
  statusColor,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';
import { notifyError } from '../../../utils/notifyError';
import AdministrationPanel from '../panels/AdministrationPanel/AdministrationPanel';
import AuditPanel from '../panels/AuditPanel/AuditPanel';
import RankingsPanel from '../panels/RankingsPanel/RankingsPanel';
import RoundsPanel from '../panels/RoundsPanel/RoundsPanel';
import TeamsPanel from '../panels/TeamsPanel/TeamsPanel';

interface GameViewContentProps {
  game: Game;
}

const GAME_TABS = [
  'teams',
  'rounds',
  'rankings',
  'administration',
  'audit',
] as const;

type GameTab = (typeof GAME_TABS)[number];

const isGameTab = (tab: string): tab is GameTab =>
  (GAME_TABS as readonly string[]).includes(tab);

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
  const [updateGame] = useUpdateGameMutation();
  const { data: tablesData } = useGetGameTablesQuery({ gameId: game.id });
  const tables = tablesData?.tables ?? [];

  const tabStorageKey = `selected_tab_for_game_${game.id}`;
  const [activeTab, setActiveTab] = useState<GameTab>(() => {
    const stored = localStorage.getItem(tabStorageKey);
    return stored && isGameTab(stored) ? stored : getDefaultTab(game.status);
  });

  const selectTab = (tab: GameTab) => {
    setActiveTab(tab);
    localStorage.setItem(tabStorageKey, tab);
  };

  const completedTables = tables.filter(
    (table) =>
      table.players?.length &&
      (table.scores?.reduce((sum, score) => sum + score.score, 0) ?? 0) > 0,
  ).length;
  const canComplete =
    game.status === 'in_progress' &&
    completedTables > 0 &&
    completedTables === tables.length;

  const sufficientTeams = game.teamSize <= (game.teams?.length ?? 0);
  const sufficientRounds = (game.rounds?.length ?? 0) === game.numberOfRounds;

  const handleStatusTransition = async (newStatus: GameStatus) => {
    const gameRequest: GameUpdateRequest = {
      name: game.name,
      numberOfRounds: game.numberOfRounds,
      teamSize: game.teamSize,
      tableSize: game.tableSize,
      status: newStatus,
    };
    try {
      await updateGame({
        gameId: game.id,
        gameUpdateRequest: gameRequest,
      }).unwrap();
      return true;
    } catch {
      notifyError();
      return false;
    }
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
      onConfirm: async () => {
        if (!(await handleStatusTransition('in_progress'))) {
          return;
        }
        selectTab('rounds');
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
      onConfirm: () => void handleStatusTransition('completed'),
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
                      completed: completedTables,
                      total: tables.length,
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
          <PrintMenu game={game} />
        </Group>
      </Group>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (value && isGameTab(value)) {
            selectTab(value);
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="teams">{t('gameDetail:tabs.teams')}</Tabs.Tab>
          <Tabs.Tab value="rounds">{t('gameDetail:tabs.rounds')}</Tabs.Tab>
          <Tabs.Tab value="rankings">{t('gameDetail:tabs.rankings')}</Tabs.Tab>
          <Tabs.Tab value="administration">
            {t('gameDetail:tabs.administration')}
          </Tabs.Tab>
          <Tabs.Tab value="audit">{t('gameDetail:tabs.audit')}</Tabs.Tab>
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

        <Tabs.Panel pt="md" value="administration">
          <AdministrationPanel game={game} />
        </Tabs.Panel>

        <Tabs.Panel pt="md" value="audit">
          <AuditPanel game={game} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default GameViewContent;
