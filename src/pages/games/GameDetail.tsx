import {
  Badge,
  Button,
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
import { GameStatusEnum, GameUpdateRequest } from '../../generated';
import CenterLoader from '../../shared/CenterLoader';
import Layout from '../../shared/Layout';
import useGames from '../../slices/games/hooks';

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { t } = useTranslation();
  const { allGames, fetchGames, status, updateGame } = useGames();

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

  const handleStatusTransition = (newStatus: GameStatusEnum) => {
    // Note: The generated GameUpdateRequest type doesn't include status,
    // but the backend API expects it. This should be fixed by regenerating
    // the API client from the updated OpenAPI spec.
    const gameRequest: GameUpdateRequest = {
      name: game.name,
      numberOfRounds: game.numberOfRounds,
      teamSize: game.teamSize,
      tableSize: game.tableSize,
      status: newStatus,
    };
    updateGame(game.id, gameRequest);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup':
        return 'gray';
      case 'in_progress':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

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
                  {t('pages.gameDetail.rounds.round')}: {game.numberOfRounds}
                </Text>
              </Group>
            </div>
            <Group gap="sm">
              <Badge
                color={getStatusColor(game.status)}
                size="lg"
                variant="filled"
              >
                {t(`pages.gameDetail.status.${game.status}`)}
              </Badge>
              {game.status === GameStatusEnum.Setup && (
                <Button
                  color="blue"
                  size="sm"
                  onClick={() =>
                    handleStatusTransition(GameStatusEnum.InProgress)
                  }
                >
                  {t('pages.gameDetail.actions.startGame')}
                </Button>
              )}
              {game.status === GameStatusEnum.InProgress && (
                <Button
                  color="green"
                  size="sm"
                  onClick={() =>
                    handleStatusTransition(GameStatusEnum.Completed)
                  }
                >
                  {t('pages.gameDetail.actions.completeGame')}
                </Button>
              )}
            </Group>
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
