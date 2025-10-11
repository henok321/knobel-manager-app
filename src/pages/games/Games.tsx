import { PlusIcon } from '@heroicons/react/24/solid';
import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import GameForm, { GameFormData } from './GameForm';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';

const Games = () => {
  const {
    status,
    error,
    allGames,
    activeGame,
    createGame,
    activateGame,
    deleteGame,
    fetchGames,
  } = useGames();

  const [gameModalActive, setGameModalActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const filteredGames = useMemo(
    () =>
      allGames.filter((game) => {
        const matchesSearch = game.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterStatus === 'all' ||
          (filterStatus === 'active' && game.status === 'active') ||
          (filterStatus === 'setup' && game.status !== 'active');
        return matchesSearch && matchesFilter;
      }),
    [allGames, searchQuery, filterStatus],
  );

  const isLoading = status === 'idle' || status === 'pending';
  const hasError = status === 'failed' && error;

  if (isLoading) {
    return <CenterLoader />;
  }

  if (hasError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text c="red" size="xl">
            {t('global.errorOccurred')}
          </Text>
          <Text c="red">{error?.message}</Text>
        </Stack>
      </Center>
    );
  }

  const handleCreateGame = (formData: GameFormData) => {
    createGame(formData);
  };

  const handleActivateGame = (gameID: number) => {
    activateGame(gameID);
  };

  const handleDeleteGame = (gameID: number) => {
    if (confirm(t('pages.games.confirmDelete'))) {
      deleteGame(gameID);
    }
  };

  return (
    <Layout navbarActive>
      <Container py="xl" size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group align="center" justify="space-between">
            <div>
              <Title mb="xs" order={1}>
                {t('pages.games.heading')}
              </Title>
              <Text c="dimmed" size="lg">
                {t('pages.games.subtitle')}
              </Text>
            </div>
            <Button
              leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
              size="lg"
              onClick={() => setGameModalActive(true)}
            >
              {t('pages.games.createGameButton')}
            </Button>
          </Group>

          <Group align="flex-end" justify="space-between">
            <TextInput
              placeholder={t('pages.games.search')}
              style={{ flex: 1, maxWidth: 400 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <SegmentedControl
              data={[
                { label: t('pages.games.filters.all'), value: 'all' },
                { label: t('pages.games.filters.active'), value: 'active' },
                { label: t('pages.games.filters.setup'), value: 'setup' },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </Group>

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <Card withBorder p="xl" radius="md">
              <Stack align="center" gap="md">
                <Text c="dimmed" size="lg" ta="center">
                  {searchQuery || filterStatus !== 'all'
                    ? t('pages.games.noResults')
                    : t('pages.games.noGames')}
                </Text>
                {!searchQuery && filterStatus === 'all' && (
                  <Button size="lg" onClick={() => setGameModalActive(true)}>
                    {t('pages.games.createFirstGame')}
                  </Button>
                )}
              </Stack>
            </Card>
          ) : (
            <Grid>
              {filteredGames.map((game) => {
                const isActiveGame = game.id === activeGame?.id;
                return (
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
                        style={{ flex: 1, justifyContent: 'space-between' }}
                      >
                        <div>
                          {/* Header */}
                          <Group
                            align="flex-start"
                            justify="space-between"
                            mb="md"
                          >
                            <div style={{ flex: 1 }}>
                              <Title mb="xs" order={3}>
                                {game.name}
                              </Title>
                              <Group gap="xs">
                                <Badge
                                  color={
                                    game.status === 'active' ? 'green' : 'gray'
                                  }
                                  variant="light"
                                >
                                  {game.status}
                                </Badge>
                                {isActiveGame && (
                                  <Badge color="blue" variant="filled">
                                    {t('pages.games.card.isActive')}
                                  </Badge>
                                )}
                              </Group>
                            </div>
                          </Group>

                          {/* Details */}
                          <Stack gap="xs">
                            <Group gap="xs">
                              <Text c="dimmed" size="sm">
                                {t('pages.games.card.details.teamSize')}
                              </Text>
                              <Text fw={600} size="sm">
                                {game.teamSize}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Text c="dimmed" size="sm">
                                {t('pages.games.card.details.tableSize')}
                              </Text>
                              <Text fw={600} size="sm">
                                {game.tableSize}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Text c="dimmed" size="sm">
                                {t('pages.games.card.details.numberOfRounds')}
                              </Text>
                              <Text fw={600} size="sm">
                                {game.numberOfRounds}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Text c="dimmed" size="sm">
                                {t('pages.games.card.details.teams')}
                              </Text>
                              <Text fw={600} size="sm">
                                {game.teams.length}
                              </Text>
                            </Group>
                          </Stack>
                        </div>

                        {/* Actions */}
                        <Stack gap="xs">
                          <Button
                            fullWidth
                            onClick={() => navigate(`/games/${game.id}`)}
                          >
                            {t('pages.games.card.viewDetails')}
                          </Button>
                          <Group gap="xs">
                            <Button
                              color="blue"
                              disabled={isActiveGame}
                              flex={1}
                              size="sm"
                              variant="light"
                              onClick={() => handleActivateGame(game.id)}
                            >
                              {t('pages.games.card.activateButton')}
                            </Button>
                            <Button
                              color="red"
                              flex={1}
                              size="sm"
                              variant="light"
                              onClick={() => handleDeleteGame(game.id)}
                            >
                              {t('pages.games.card.deleteButton')}
                            </Button>
                          </Group>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          )}
        </Stack>
      </Container>

      <GameForm
        createGame={handleCreateGame}
        isOpen={gameModalActive}
        onClose={() => setGameModalActive(false)}
      />
    </Layout>
  );
};

export default Games;
