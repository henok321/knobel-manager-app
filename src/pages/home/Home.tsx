import {
  CheckCircleIcon,
  CogIcon,
  PlayIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import GameViewContent from '../../components/GameViewContent';
import { GameStatusEnum } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';
import useTables from '../../slices/tables/hooks';

const badgeColorByStatus = (gameStatus: GameStatusEnum) =>
  gameStatus === GameStatusEnum.InProgress
    ? 'blue'
    : gameStatus === GameStatusEnum.Completed
      ? 'green'
      : 'gray';

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

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeGame, allGames, fetchGames, status, activateGame } = useGames();
  const { fetchAllTables } = useTables();

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
                                  leftSection={getStatusIcon(game.status)}
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

  return (
    <Layout navbarActive>
      <Container py="md" size="xl">
        <GameViewContent game={activeGame} />
      </Container>
    </Layout>
  );
};

export default Home;
