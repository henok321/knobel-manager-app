import { Container, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '../../../shared/Breadcrumbs.tsx';
import CenterLoader from '../../../shared/CenterLoader';
import Layout from '../../../shared/layout/Layout.tsx';
import useGames from '../../../slices/games/hooks';
import useTables from '../../../slices/tables/hooks.ts';
import GameViewContent from './GameViewContent';

const GameDetail = () => {
  const { gameID } = useParams<{ gameID: string }>();
  const { t } = useTranslation();
  const { allGames, fetchGames, status } = useGames();
  const { fetchAllTables } = useTables();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const game = allGames.find((g) => g.id === Number(gameID));

  const selectedGameId = game?.id;
  const numberOfRounds = game?.numberOfRounds;
  const hasRounds = (game?.rounds.length ?? 0) > 0;

  useEffect(() => {
    if (
      selectedGameId !== undefined &&
      numberOfRounds !== undefined &&
      hasRounds
    ) {
      fetchAllTables(selectedGameId, numberOfRounds);
    }
  }, [fetchAllTables, selectedGameId, numberOfRounds, hasRounds]);

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
