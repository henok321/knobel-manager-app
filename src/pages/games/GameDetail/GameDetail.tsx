import { Anchor, Breadcrumbs, Container, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import CenterLoader from '../../../shared/CenterLoader';
import Layout from '../../../shared/layout/Layout.tsx';
import { useGetGameQuery } from '../../../store/api.ts';
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

  if (isLoading) {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Layout>
        <Container py="md">
          <Text c="red" size="xl">
            {t('gameDetail:notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container py="md" size="xl">
        <Stack gap="lg">
          <Breadcrumbs>
            <Anchor component={Link} to="/games">
              {t('common:header.nav.games')}
            </Anchor>
            <Text c="dimmed">{game.name}</Text>
          </Breadcrumbs>
          <GameViewContent game={game} />
        </Stack>
      </Container>
    </Layout>
  );
};

export default GameDetail;
