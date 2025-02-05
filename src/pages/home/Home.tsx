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
    <p>
      {game.id} - {game.name}
    </p>
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
      <div className="flex h-screen items-center justify-center text-xl">
        {t('global.loading')}
      </div>
    );
  }

  return (
    <Layout logoutButton navBar>
      <h1 className="mb-4 text-2xl font-bold">{t('pages.home.heading')}</h1>

      {activeGame ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {renderActiveGame(activeGame)}
          </h2>

          <button
            className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            onClick={() => setGameModalActive(true)}
          >
            {t('pages.home.createTeamButton')}
          </button>

          <TeamForm
            createTeam={handleCreateTeam}
            isOpen={gameModalActive}
            teamSize={activeGame.teamSize}
            onClose={() => setGameModalActive(false)}
          />
        </div>
      ) : (
        <div>
          <p>{t('pages.home.noActiveGame')}</p>
        </div>
      )}

      <div>
        {teams.map((team) => (
          <div key={team.id}>
            <h3>{team.name}</h3>
            <ul>
              {team.players.map((player) => (
                <li key={player}>{player}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
