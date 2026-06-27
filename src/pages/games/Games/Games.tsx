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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CenterLoader from '../../../shared/CenterLoader';
import Layout from '../../../shared/layout/Layout.tsx';
import {
  useCreateGameMutation,
  useDeleteGameMutation,
  useGetGamesQuery,
} from '../../../store/api.ts';
import type { Game } from '../../../store/generatedApi.ts';
import { assertNever } from '../../../utils/assertNever';
import GameForm from './GameForm';
import GameListItem from './GameListItem';

const Games = () => {
  const { data, isLoading, isError, error } = useGetGamesQuery(undefined);
  const allGames = data?.games ?? [];
  const [createGame] = useCreateGameMutation();
  const [deleteGame] = useDeleteGameMutation();

  const [gameModalActive, setGameModalActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const filtered = allGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeAndInProgressGames: Game[] = [];
  const completedGames: Game[] = [];
  for (const game of filtered) {
    switch (game.status) {
      case 'setup':
      case 'in_progress':
        activeAndInProgressGames.push(game);
        break;
      case 'completed':
        completedGames.push(game);
        break;
      default:
        assertNever(game.status);
    }
  }

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
        void deleteGame({ gameId: gameID });
      },
    });
  };

  if (isLoading) {
    return <CenterLoader />;
  }

  if (isError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text c="red" size="xl">
            {t('common:actions.errorOccurred')}
          </Text>
          {error != null && <Text c="red">{JSON.stringify(error)}</Text>}
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
              leftSection={<IconPlus size={20} stroke={1.5} />}
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
        createGame={(game) => createGame({ gameCreateRequest: game })}
        isOpen={gameModalActive}
        onClose={() => setGameModalActive(false)}
      />
    </Layout>
  );
};

export default Games;
