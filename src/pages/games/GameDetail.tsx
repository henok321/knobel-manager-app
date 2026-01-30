import { Container, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import GameViewContent from './components/GameViewContent.tsx';
import Breadcrumbs from '../../shared/Breadcrumbs.tsx';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/layout/Layout.tsx';
import useGames from '../../slices/games/hooks';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();
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
      <Layout navbarActive={true}>
        <Container py="md">
          <Text c="red" size="xl">
            {t('gameDetail:notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

  const breadcrumbItems = [
    { label: t('common:header.nav.games'), path: '/games' },
    { label: game.name },
  ];

  return (
    <Layout navbarActive={true}>
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
