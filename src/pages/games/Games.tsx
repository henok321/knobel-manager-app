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
import GameForm, { GameFormData } from './GameForm';
import { GameStatusEnum } from '../../generated';
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
        (game) =>
          game.status === GameStatusEnum.Setup ||
          game.status === GameStatusEnum.InProgress,
      ),
      completedGames: filtered.filter(
        (game) => game.status === GameStatusEnum.Completed,
      ),
    };
  }, [allGames, searchQuery]);

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
    modals.openConfirmModal({
      title: t('pages.games.deleteGame'),
      children: <Text size="sm">{t('pages.games.confirmDelete')}</Text>,
      labels: {
        confirm: t('global.delete'),
        cancel: t('global.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteGame(gameID);
      },
    });
  };

  const hasGames =
    activeAndInProgressGames.length > 0 || completedGames.length > 0;

  return (
    <Layout navbarActive onOpenGameForm={() => setGameModalActive(true)}>
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
              leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
              size="lg"
              onClick={() => setGameModalActive(true)}
            >
              {t('pages.games.createGameButton')}
            </Button>
          </Group>

          {hasGames && (
            <TextInput
              placeholder={t('pages.games.search')}
              size="md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          )}

          {/* Empty State */}
          {!hasGames && (
            <Card withBorder p="xl" radius="md">
              <Stack align="center" gap="md">
                <Text c="dimmed" size="lg" ta="center">
                  {searchQuery
                    ? t('pages.games.noResults')
                    : t('pages.games.noGames')}
                </Text>
                {!searchQuery && (
                  <Button size="lg" onClick={() => setGameModalActive(true)}>
                    {t('pages.games.createFirstGame')}
                  </Button>
                )}
              </Stack>
            </Card>
          )}

          {activeAndInProgressGames.length > 0 && (
            <Stack gap="md">
              <Title order={3}>
                {t('pages.games.filters.active')} &{' '}
                {t('pages.games.filters.setup')}
              </Title>
              {activeAndInProgressGames.map((game) => (
                <GameListItem
                  key={game.id}
                  game={game}
                  isActive={game.id === activeGame?.id}
                  onActivate={handleActivateGame}
                  onDelete={handleDeleteGame}
                />
              ))}
            </Stack>
          )}

          {completedGames.length > 0 && (
            <Stack gap="md">
              <Divider />
              <Title order={3}>{t('pages.gameDetail.status.completed')}</Title>
              {completedGames.map((game) => (
                <GameListItem
                  key={game.id}
                  game={game}
                  isActive={game.id === activeGame?.id}
                  onActivate={handleActivateGame}
                  onDelete={handleDeleteGame}
                />
              ))}
            </Stack>
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
