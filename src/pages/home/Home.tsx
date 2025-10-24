import { PlusIcon } from '@heroicons/react/24/solid';
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import GameViewContent from '../../components/GameViewContent';
import { GameStatusEnum } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';
import useTables from '../../slices/tables/hooks';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeGame, allGames, fetchGames, status } = useGames();
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

  // Show welcome CTA when no active game
  if (!activeGame) {
    return (
      <Layout navbarActive>
        <Container py="xl" size="md">
          <Stack align="center" gap="xl" py="xl">
            <Stack align="center" gap="md">
              <Text size="80px">🎲</Text>
              <Title order={1} ta="center">
                {t('pages.home.noActiveGame')}
              </Title>
              <Text c="dimmed" size="lg" ta="center">
                {allGames.length === 0
                  ? t('pages.home.picker.noGames')
                  : t('pages.home.dashboard.noActiveGameDescription')}
              </Text>
            </Stack>

            <Group gap="md">
              <Button
                leftSection={<PlusIcon style={{ width: 20, height: 20 }} />}
                size="lg"
                onClick={() => navigate('/games')}
              >
                {t('pages.home.picker.createGame')}
              </Button>
              {allGames.length > 0 && (
                <Button
                  size="lg"
                  variant="light"
                  onClick={() => navigate('/games')}
                >
                  {t('pages.home.dashboard.viewAllGames')}
                </Button>
              )}
            </Group>
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
