import { Container, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../../components/Breadcrumbs';
import GameViewContent from '../../components/GameViewContent';
import { GameStatusEnum } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';
import useTables from '../../slices/tables/hooks';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allGames, fetchGames, status } = useGames();
  const { fetchAllTables } = useTables();

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const game = allGames.find((g) => g.id === Number(gameId));

  useEffect(() => {
    if (game && game.status === GameStatusEnum.InProgress) {
      fetchAllTables(game.id, game.numberOfRounds);
    }
  }, [game, fetchAllTables]);

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Layout navbarActive onOpenGameForm={() => navigate('/games')}>
        <Container py="md">
          <Text c="red" size="xl">
            {t('pages.gameDetail.notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

  const breadcrumbItems = [
    { label: t('header.nav.home'), path: '/' },
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
