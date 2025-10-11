import {
  Badge,
  Button,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import RankingsPanel from './panels/RankingsPanel';
import RoundsPanel from './panels/RoundsPanel';
import TeamsPanel from './panels/TeamsPanel';
import { GameStatusEnum, GameUpdateRequest } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';
import useTables from '../../slices/tables/hooks';
import { tablesSelectors } from '../../slices/tables/slice';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();
  const { allGames, fetchGames, status, updateGame } = useGames();
  const { fetchAllTables } = useTables();
  const allTables = useSelector(tablesSelectors.selectAll);

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const game = allGames.find((g) => g.id === Number(gameId));

  useEffect(() => {
    if (game && game.status === GameStatusEnum.InProgress) {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game, fetchAllTables]);

  // Check if all scores are entered using useMemo
  const canComplete = useMemo(() => {
    if (!game || game.status !== GameStatusEnum.InProgress) {
      return false;
    }

    const tablesByRound: Record<number, typeof allTables> = {};
    for (const table of allTables) {
      tablesByRound[table.roundID] ??= [];
      tablesByRound[table.roundID]?.push(table);
    }

    for (let roundNum = 1; roundNum <= game.numberOfRounds; roundNum++) {
      const tablesForRound = tablesByRound[roundNum];

      if (!tablesForRound || tablesForRound.length === 0) {
        return false;
      }

      for (const table of tablesForRound) {
        if (!table.players || table.players.length === 0) {
          return false;
        }

        const playerCount = table.players.length;
        const scoreCount = table.scores?.length || 0;

        if (scoreCount !== playerCount) {
          return false;
        }
      }
    }

    return true;
  }, [game, allTables]);

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Layout navbarActive>
        <Container py="md">
          <Text c="red" size="xl">
            {t('pages.gameDetail.notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

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

  return (
    <Layout navbarActive>
      <Container py="md" size="xl">
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
                size="lg"
                variant="filled"
              >
                {t(`pages.gameDetail.status.${game.status}`)}
              </Badge>
              {game.status === GameStatusEnum.Setup && (
                <Button
                  color="blue"
                  size="sm"
                  onClick={() =>
                    handleStatusTransition(GameStatusEnum.InProgress)
                  }
                >
                  {t('pages.gameDetail.actions.startGame')}
                </Button>
              )}
              {game.status === GameStatusEnum.InProgress && (
                <Tooltip
                  disabled={canComplete}
                  label={t(
                    'pages.gameDetail.actions.completeGameDisabledTooltip',
                  )}
                >
                  <Button
                    color="green"
                    disabled={!canComplete}
                    size="sm"
                    onClick={() =>
                      handleStatusTransition(GameStatusEnum.Completed)
                    }
                  >
                    {t('pages.gameDetail.actions.completeGame')}
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>

          {/* Tabs */}
          <Tabs defaultValue="teams">
            <Tabs.List>
              <Tabs.Tab value="teams">
                {t('pages.gameDetail.tabs.teams')}
              </Tabs.Tab>
              <Tabs.Tab value="rounds">
                {t('pages.gameDetail.tabs.rounds')}
              </Tabs.Tab>
              <Tabs.Tab value="rankings">
                {t('pages.gameDetail.tabs.rankings')}
              </Tabs.Tab>
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
      </Container>
    </Layout>
  );
};

export default GameDetail;
