import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';

const Home = () => {
  const { t } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const { activeGame, allGames, fetchGames, status } = useGames();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  if (activeGame) {
    navigate(`/games/${activeGame.id}`, { replace: true });
  }

  return (
    <Layout navbarActive onOpenGameForm={() => navigate('/games')}>
      <Container py="xl" size="xl">
        <Stack align="center" gap="xl" py="xl">
          <Stack align="center" gap="md">
            <Text size="80px">🎲</Text>
            <Title order={1} ta="center">
              {t('noActiveGame')}
            </Title>
            <Text c="dimmed" size="lg" ta="center">
              {allGames.length === 0
                ? t('picker.noGames')
                : t('dashboard.noActiveGameDescription')}
            </Text>
          </Stack>

          <Group gap="md" justify="center">
            <Button
              leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
              size="lg"
              onClick={() => navigate('/games')}
            >
              {t('picker.createGame')}
            </Button>
            {allGames.length > 0 && (
              <Button
                size="lg"
                variant="light"
                onClick={() => navigate('/games')}
              >
                {t('dashboard.viewAllGames')}
              </Button>
            )}
          </Group>
        </Stack>
      </Container>
    </Layout>
  );
};

export default Home;
