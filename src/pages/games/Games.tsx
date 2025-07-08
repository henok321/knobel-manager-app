import { Container, Title, Button, Stack, Center, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import GameCard from './GameCard';
import GameForm, { GameFormData } from './GameForm.tsx';
import Layout from '../../components/Layout.tsx';
import useGames from '../../slices/games/hooks.ts';

const Games = () => {
  const {
    status,
    error,
    allGames,
    activeGame,
    fetchGames,
    createGame,
    activateGame,
    deleteGame,
  } = useGames();

  const [gameModalActive, setGameModalActive] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const isLoading = status === 'idle' || status === 'pending';
  const hasError = status === 'failed' && error;

  if (isLoading) {
    return (
      <Center h="100vh">
        <Text size="xl">{t('global.loading')}</Text>
      </Center>
    );
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
    deleteGame(gameID);
  };

  return (
    <Layout logoutButton navBar>
      <Container py="md" size="sm">
        <Title mb="md" order={1}>
          {t('pages.games.heading')}
        </Title>
        <Button mb="md" onClick={() => setGameModalActive(true)}>
          {t('pages.games.createGameButton')}
        </Button>
        <Stack gap="md">
          {allGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isActiveGame={game.id === activeGame?.id}
              onActivate={handleActivateGame}
              onDelete={handleDeleteGame}
            />
          ))}
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
