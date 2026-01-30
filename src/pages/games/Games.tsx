import {
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GameListItem from './components/GameListItem';
import GameForm from './GameForm';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/layout/Layout.tsx';
import useGames from '../../slices/games/hooks';

const Games = () => {
  const { status, error, allGames, createGame, deleteGame, fetchGames } =
    useGames();

  const [gameModalActive, setGameModalActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const { activeAndInProgressGames, completedGames } = useMemo(() => {
    const filtered = allGames.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return {
      activeAndInProgressGames: filtered.filter(
        (game) => game.status === 'setup' || game.status === 'in_progress',
      ),
      completedGames: filtered.filter((game) => game.status === 'completed'),
    };
  }, [allGames, searchQuery]);

  const handleDeleteGame = (gameID: number) => {
    modals.openConfirmModal({
      title: t('games:deleteGame'),
      children: <Text size="sm">{t('games:confirmDelete')}</Text>,
      labels: {
        confirm: t('common:actions.delete'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteGame(gameID);
      },
    });
  };

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
            {t('common:actions.errorOccurred')}
          </Text>
          <Text c="red">{error}</Text>
        </Stack>
      </Center>
    );
  }

  const hasGames =
    activeAndInProgressGames.length > 0 || completedGames.length > 0;

  return (
    <Layout navbarActive={true}>
      <Container py="xl" size="xl">
        <Stack gap="xl">
          <Group align="center" justify="space-between">
            <div>
              <Title mb="xs" order={1}>
                {t('games:heading')}
              </Title>
              <Text c="dimmed" size="lg">
                {t('games:subtitle')}
              </Text>
            </div>
            <Button
              leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
              size="lg"
              onClick={() => setGameModalActive(true)}
            >
              {t('games:createGameButton')}
            </Button>
          </Group>

          <TextInput
            placeholder={t('games:search')}
            size="md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          {!hasGames && (
            <Card withBorder p="xl" radius="md">
              <Stack align="center" gap="md">
                <Text c="dimmed" size="lg" ta="center">
                  {searchQuery ? t('games:noResults') : t('games:noGames')}
                </Text>
                {!searchQuery && (
                  <Button size="lg" onClick={() => setGameModalActive(true)}>
                    {t('games:createFirstGame')}
                  </Button>
                )}
              </Stack>
            </Card>
          )}

          {activeAndInProgressGames.length > 0 && (
            <Stack gap="md">
              <Title order={3}>
                {t('games:filters.active')} & {t('games:filters.setup')}
              </Title>
              {activeAndInProgressGames.map((game) => (
                <GameListItem
                  key={game.id}
                  game={game}
                  onDelete={handleDeleteGame}
                />
              ))}
            </Stack>
          )}

          {completedGames.length > 0 && (
            <Stack gap="md">
              <Divider />
              <Title order={3}>{t('gameDetail:status.completed')}</Title>
              {completedGames.map((game) => (
                <GameListItem
                  key={game.id}
                  game={game}
                  onDelete={handleDeleteGame}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      <GameForm
        createGame={createGame}
        isOpen={gameModalActive}
        onClose={() => setGameModalActive(false)}
      />
    </Layout>
  );
};

export default Games;
