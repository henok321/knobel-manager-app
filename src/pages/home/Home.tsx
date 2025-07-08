import { Container, Title, Button, Stack, Center, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TeamForm, { TeamFormData } from './TeamForm.tsx';
import Layout from '../../components/Layout.tsx';
import useGames from '../../slices/games/hooks.ts';
import useTeams from '../../slices/teams/hooks.ts';
import { selectTeamsByGameId } from '../../slices/teams/slice.ts';
import { Game } from '../../slices/types.ts';
import { RootState } from '../../store/store.ts';

const Home = () => {
  const { t } = useTranslation();
  const { activeGame, fetchGames, status } = useGames();
  const [gameModalActive, setGameModalActive] = useState(false);
  const { createTeam } = useTeams();

  const teams = useSelector((state: RootState) =>
    activeGame?.id ? selectTeamsByGameId(state, activeGame.id) : [],
  );

  const renderActiveGame = (game: Game) => (
    <Text>
      {game.id} - {game.name}
    </Text>
  );

  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  const handleCreateTeam = (team: TeamFormData) => {
    if (activeGame) {
      createTeam(activeGame.id, {
        name: team.name,
        players: team.members.map((p) => ({ name: p })),
      });
    }
  };

  if (status === 'pending') {
    return (
      <Center h="100vh">
        <Text size="xl">{t('global.loading')}</Text>
      </Center>
    );
  }

  return (
    <Layout logoutButton navBar>
      <Container py="md" size="sm">
        <Title mb="md" order={1}>
          {t('pages.home.heading')}
        </Title>

        {activeGame ? (
          <Stack gap="md">
            <Title order={2} size="h3">
              {renderActiveGame(activeGame)}
            </Title>

            <Button mb="md" onClick={() => setGameModalActive(true)}>
              {t('pages.home.createTeamButton')}
            </Button>

            <TeamForm
              createTeam={handleCreateTeam}
              isOpen={gameModalActive}
              teamSize={activeGame.teamSize}
              onClose={() => setGameModalActive(false)}
            />
          </Stack>
        ) : (
          <Text>{t('pages.home.noActiveGame')}</Text>
        )}

        <Stack gap="md" mt="xl">
          {teams.map((team) => (
            <Stack key={team.id} gap="xs">
              <Title order={3} size="h4">
                {team.name}
              </Title>
              <ul style={{ margin: 0 }}>
                {team.players.map((player) => (
                  <li key={player}>{player}</li>
                ))}
              </ul>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Layout>
  );
};

export default Home;
