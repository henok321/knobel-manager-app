import {
  Badge,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import RankingsPanel from './panels/RankingsPanel';
import RoundsPanel from './panels/RoundsPanel';
import TeamsPanel from './panels/TeamsPanel';
import CenterLoader from '../../components/CenterLoader';
import Layout from '../../components/Layout';
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
      <Layout navbarActive>
        <Container py="md">
          <Text c="red" size="xl">
            {t('pages.gameDetail.notFound')}
          </Text>
        </Container>
      </Layout>
    );
  }

  const isGameActive = game.status === 'active';

  return (
    <Layout navbarActive>
      <Container py="md" size="xl">
        <Stack gap="md">
          {/* Game Header */}
          <Group align="center" justify="space-between">
            <div>
              <Title order={1}>{game.name}</Title>
              <Group gap="xs" mt="xs">
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.teamSize')}: {game.teamSize}
                </Text>
                <Text c="dimmed">•</Text>
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.tableSize')}: {game.tableSize}
                </Text>
                <Text c="dimmed">•</Text>
                <Text c="dimmed" size="sm">
                  {t('pages.gameDetail.rounds')}: {game.numberOfRounds}
                </Text>
              </Group>
            </div>
            <Badge
              color={isGameActive ? 'green' : 'gray'}
              size="lg"
              variant="filled"
            >
              {game.status}
            </Badge>
          </Group>

          {/* Tabs */}
          <Tabs defaultValue="teams">
            <Tabs.List>
              <Tabs.Tab value="teams">
                {t('pages.gameDetail.tabs.teams')}
              </Tabs.Tab>
              <Tabs.Tab value="rounds">
                {t('pages.gameDetail.tabs.rounds')}
              </Tabs.Tab>
              <Tabs.Tab value="rankings">
                {t('pages.gameDetail.tabs.rankings')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel pt="md" value="teams">
              <TeamsPanel game={game} />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="rounds">
              <RoundsPanel game={game} />
            </Tabs.Panel>

            <Tabs.Panel pt="md" value="rankings">
              <RankingsPanel game={game} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Layout>
  );
};

export default GameDetail;
