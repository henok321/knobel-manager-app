import { PlusIcon } from '@heroicons/react/24/solid';
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
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
import { useNavigate } from 'react-router-dom';

import { GameStatusEnum, GameUpdateRequest } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';
import useTables from '../../slices/tables/hooks';
import { tablesSelectors } from '../../slices/tables/slice';
import RankingsPanel from '../games/panels/RankingsPanel';
import RoundsPanel from '../games/panels/RoundsPanel';
import TeamsPanel from '../games/panels/TeamsPanel';

const badgeColorByStatus = (gameStatus: GameStatusEnum) =>
  gameStatus === GameStatusEnum.InProgress
    ? 'blue'
    : gameStatus === GameStatusEnum.Completed
      ? 'green'
      : 'gray';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeGame, allGames, fetchGames, status, updateGame, activateGame } =
    useGames();
  const { fetchAllTables } = useTables();
  const allTables = useSelector(tablesSelectors.selectAll);

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  useEffect(() => {
    if (activeGame && activeGame.status === GameStatusEnum.InProgress) {
      fetchAllTables(activeGame.id, activeGame.numberOfRounds);
    }
  }, [activeGame, fetchAllTables]);

  const canComplete = useMemo(() => {
    if (!activeGame || activeGame.status !== GameStatusEnum.InProgress) {
      return false;
    }

    const tablesByRound: Record<number, typeof allTables> = {};
    for (const table of allTables) {
      tablesByRound[table.roundID] ??= [];
      tablesByRound[table.roundID]?.push(table);
    }

    for (let roundNum = 1; roundNum <= activeGame.numberOfRounds; roundNum++) {
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
  }, [activeGame, allTables]);

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  // Show game picker when no active game
  if (!activeGame) {
    return (
      <Layout navbarActive>
        <Container py="xl" size="xl">
          <Stack gap="xl">
            {/* Header */}
            <div>
              <Title mb="xs" order={1}>
                {t('pages.home.picker.title')}
              </Title>
              <Text c="dimmed" size="lg">
                {t('pages.home.picker.subtitle')}
              </Text>
            </div>

            {/* No games state */}
            {allGames.length === 0 ? (
              <Card withBorder p="xl" radius="md">
                <Stack align="center" gap="md">
                  <Text c="dimmed" size="lg" ta="center">
                    {t('pages.home.picker.noGames')}
                  </Text>
                  <Button
                    leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
                    size="lg"
                    onClick={() => navigate('/games')}
                  >
                    {t('pages.home.picker.createGame')}
                  </Button>
                </Stack>
              </Card>
            ) : (
              <>
                {/* Action Button */}
                <Group justify="flex-end">
                  <Button
                    leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
                    size="md"
                    variant="light"
                    onClick={() => navigate('/games')}
                  >
                    {t('pages.home.picker.createGame')}
                  </Button>
                </Group>

                {/* Games Grid */}
                <Grid>
                  {allGames.map((game) => (
                    <Grid.Col key={game.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <Card
                        withBorder
                        padding="lg"
                        radius="md"
                        shadow="sm"
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Stack
                          gap="md"
                          style={{
                            flex: 1,
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            {/* Header */}
                            <Group mb="md">
                              <div style={{ flex: 1 }}>
                                <Title mb="xs" order={3}>
                                  {game.name}
                                </Title>
                                <Badge
                                  color={badgeColorByStatus(game.status)}
                                  variant="light"
                                >
                                  {t(`pages.gameDetail.status.${game.status}`)}
                                </Badge>
                              </div>
                            </Group>

                            {/* Details */}
                            <Stack gap="xs">
                              <Group gap="xs">
                                <Text c="dimmed" size="sm">
                                  {t('pages.gameDetail.teamSize')}:
                                </Text>
                                <Text fw={600} size="sm">
                                  {game.teamSize}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <Text c="dimmed" size="sm">
                                  {t('pages.gameDetail.tableSize')}:
                                </Text>
                                <Text fw={600} size="sm">
                                  {game.tableSize}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <Text c="dimmed" size="sm">
                                  {t('pages.gameDetail.rounds.round')}:
                                </Text>
                                <Text fw={600} size="sm">
                                  {game.numberOfRounds}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <Text c="dimmed" size="sm">
                                  {t('pages.home.picker.teams')}:
                                </Text>
                                <Text fw={600} size="sm">
                                  {game.teams.length}
                                </Text>
                              </Group>
                            </Stack>
                          </div>

                          {/* Actions */}
                          <Button
                            fullWidth
                            onClick={() => activateGame(game.id)}
                          >
                            {t('pages.home.picker.selectGame')}
                          </Button>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </>
            )}
          </Stack>
        </Container>
      </Layout>
    );
  }

  const handleStatusTransition = (newStatus: GameStatusEnum) => {
    const gameRequest: GameUpdateRequest = {
      name: activeGame.name,
      numberOfRounds: activeGame.numberOfRounds,
      teamSize: activeGame.teamSize,
      tableSize: activeGame.tableSize,
      status: newStatus,
    };
    updateGame(activeGame.id, gameRequest);
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
              <Title order={1}>{activeGame.name}</Title>
              <Group gap="xs" mt="xs">
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.teamSize')}: {activeGame.teamSize}
                </Text>
                <Text c="dimmed">•</Text>
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.tableSize')}: {activeGame.tableSize}
                </Text>
                <Text c="dimmed">•</Text>
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.rounds.round')}:{' '}
                  {activeGame.numberOfRounds}
                </Text>
              </Group>
            </div>
            <Group gap="sm">
              <Badge
                color={getStatusColor(activeGame.status)}
                size="lg"
                variant="filled"
              >
                {t(`pages.gameDetail.status.${activeGame.status}`)}
              </Badge>
              {activeGame.status === GameStatusEnum.Setup && (
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
              {activeGame.status === GameStatusEnum.InProgress && (
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
              <TeamsPanel game={activeGame} />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="rounds">
              <RoundsPanel game={activeGame} />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="rankings">
              <RankingsPanel game={activeGame} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Layout>
  );
};

export default Home;
