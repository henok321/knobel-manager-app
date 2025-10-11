import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import TeamForm, { TeamFormData } from './TeamForm';
import CenterLoader from '../../components/CenterLoader';
import Layout from '../../components/Layout';
import useGames from '../../slices/games/hooks';
import useTeams from '../../slices/teams/hooks';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allGames, activeGame, fetchGames, status } = useGames();
  const { allTeams, createTeam } = useTeams();
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const handleCreateTeam = (teamData: TeamFormData) => {
    if (!activeGame) return;
    const teamsRequest = {
      name: teamData.name,
      players: teamData.members.map((name) => ({ name })),
    };
    createTeam(activeGame.id, teamsRequest);
    setIsTeamFormOpen(false);
  };

  if (status === 'pending' || status === 'idle') {
    return <CenterLoader />;
  }

  const totalGames = allGames.length;
  const totalTeams = allTeams.length;
  const activeGameTeams = activeGame
    ? allTeams.filter((team) => activeGame.teams.includes(team?.id || 0)).length
    : 0;

  return (
    <Layout navbarActive>
      <Container py="xl" size="xl">
        <Stack gap="xl">
          {/* Header */}
          <div>
            <Title mb="xs" order={1}>
              {t('pages.home.dashboard.title')}
            </Title>
            <Text c="dimmed" size="lg">
              {t('pages.home.dashboard.subtitle')}
            </Text>
          </div>

          {/* Stats Cards */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" shadow="sm">
                <Stack gap="xs">
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {t('pages.home.dashboard.stats.totalGames')}
                  </Text>
                  <Group align="center" justify="space-between">
                    <Text fw={700} size="xl">
                      {totalGames}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => navigate('/games')}
                    >
                      {t('pages.home.dashboard.viewAll')}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" shadow="sm">
                <Stack gap="xs">
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {t('pages.home.dashboard.stats.totalTeams')}
                  </Text>
                  <Text fw={700} size="xl">
                    {totalTeams}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md" radius="md" shadow="sm">
                <Stack gap="xs">
                  <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                    {t('pages.home.dashboard.stats.activeGame')}
                  </Text>
                  <Text fw={700} size="xl">
                    {activeGame ? '1' : '0'}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {activeGame ? (
            <Card withBorder padding="lg" radius="md" shadow="md">
              <Stack gap="md">
                <Group align="center" justify="space-between">
                  <div>
                    <Group gap="xs" mb="xs">
                      <Title order={2}>{activeGame.name}</Title>
                      <Badge
                        color={
                          activeGame.status === 'active' ? 'green' : 'blue'
                        }
                        size="lg"
                        variant="filled"
                      >
                        {activeGame.status}
                      </Badge>
                    </Group>
                    <Text c="dimmed">
                      {t('pages.home.dashboard.activeGame.description')}
                    </Text>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => navigate(`/games/${activeGame.id}`)}
                  >
                    {t('pages.home.dashboard.activeGame.manage')}
                  </Button>
                </Group>

                {/* Game Details Grid */}
                <Grid>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Stack gap={4}>
                      <Text c="dimmed" size="sm">
                        {t('pages.gameDetail.teamSize')}
                      </Text>
                      <Text fw={600} size="lg">
                        {activeGame.teamSize}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Stack gap={4}>
                      <Text c="dimmed" size="sm">
                        {t('pages.gameDetail.tableSize')}
                      </Text>
                      <Text fw={600} size="lg">
                        {activeGame.tableSize}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Stack gap={4}>
                      <Text c="dimmed" size="sm">
                        {t('pages.gameDetail.rounds.round')}
                      </Text>
                      <Text fw={600} size="lg">
                        {activeGame.numberOfRounds}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Stack gap={4}>
                      <Text c="dimmed" size="sm">
                        {t('pages.home.dashboard.activeGame.teams')}
                      </Text>
                      <Text fw={600} size="lg">
                        {activeGameTeams}
                      </Text>
                    </Stack>
                  </Grid.Col>
                </Grid>

                {/* Quick Actions */}
                {activeGame.status !== 'active' && (
                  <Group gap="sm" mt="md">
                    <Button
                      variant="light"
                      onClick={() => setIsTeamFormOpen(true)}
                    >
                      {t('pages.home.dashboard.activeGame.addTeam')}
                    </Button>
                  </Group>
                )}
              </Stack>
            </Card>
          ) : (
            <Paper withBorder p="xl" radius="md">
              <Stack align="center" gap="md">
                <Text c="dimmed" size="lg" ta="center">
                  {t('pages.home.dashboard.noActiveGame')}
                </Text>
                <Button size="lg" onClick={() => navigate('/games')}>
                  {t('pages.home.dashboard.createGame')}
                </Button>
              </Stack>
            </Paper>
          )}

          {allGames.length > 0 && (
            <div>
              <Group justify="space-between" mb="md">
                <Title order={3}>{t('pages.home.dashboard.recentGames')}</Title>
                <Button variant="subtle" onClick={() => navigate('/games')}>
                  {t('pages.home.dashboard.viewAll')}
                </Button>
              </Group>
              <Grid>
                {allGames.slice(0, 3).map((game) => (
                  <Grid.Col key={game.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card
                      withBorder
                      padding="md"
                      radius="md"
                      shadow="sm"
                      style={{ cursor: 'pointer', height: '100%' }}
                      onClick={() => navigate(`/games/${game.id}`)}
                    >
                      <Stack gap="xs">
                        <Group align="center" justify="space-between">
                          <Text fw={600} size="lg">
                            {game.name}
                          </Text>
                          <Badge
                            color={game.status === 'active' ? 'green' : 'gray'}
                            size="sm"
                            variant="light"
                          >
                            {game.status}
                          </Badge>
                        </Group>
                        <Text c="dimmed" size="sm">
                          {game.teams.length} {t('pages.home.dashboard.teams')}{' '}
                          • {game.numberOfRounds}{' '}
                          {t('pages.home.dashboard.rounds')}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </div>
          )}
        </Stack>
      </Container>

      {activeGame && (
        <TeamForm
          createTeam={handleCreateTeam}
          isOpen={isTeamFormOpen}
          teamSize={activeGame.teamSize}
          onClose={() => setIsTeamFormOpen(false)}
        />
      )}
    </Layout>
  );
};

export default Home;
