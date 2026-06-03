import { Container, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '../../../shared/Breadcrumbs.tsx';
import CenterLoader from '../../../shared/CenterLoader';
import Layout from '../../../shared/layout/Layout.tsx';
import { useGetGameQuery, useGetGameTablesQuery } from '../../../store/api.ts';
import GameViewContent from './GameViewContent';

const GameDetail = () => {
  const { gameID } = useParams<{ gameID: string }>();
  const { t } = useTranslation();
  const gameId = Number(gameID);

  const { data, isLoading } = useGetGameQuery(
    { gameId },
    {
      skip: Number.isNaN(gameId),
    },
  );
  const game = data?.game;

  const hasRounds = (game?.rounds?.length ?? 0) > 0;

  // Warm the tables cache for the game once it is known to have rounds.
  useGetGameTablesQuery(
    { gameId },
    {
      skip: Number.isNaN(gameId) || !hasRounds,
    },
  );

  if (isLoading) {
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
