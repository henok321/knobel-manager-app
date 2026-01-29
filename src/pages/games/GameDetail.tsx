import { Container, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import GameViewContent from './components/GameViewContent.tsx';
import Breadcrumbs from '../../shared/Breadcrumbs.tsx';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation(['gameDetail', 'common']);
  const navigate = useNavigate();
  const { allGames, fetchGames, status } = useGames();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const game = allGames.find((g) => g.id === Number(gameId));

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Layout navbarActive onOpenGameForm={() => navigate('/games')}>
        <Container py="md">
          <Text c="red" size="xl">
            {t('notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

  const breadcrumbItems = [
    { label: t('header.nav.games'), path: '/games' },
    { label: game.name },
  ];

  return (
    <Layout navbarActive onOpenGameForm={() => navigate('/games')}>
      <Container py="md" size="xl">
        <Stack gap="lg">
          <Breadcrumbs items={breadcrumbItems} />
          <GameViewContent game={game} />
        </Stack>
      </Container>
    </Layout>
  );
};

export default GameDetail;
