import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout.tsx';
import useGames from '../../slices/games/hooks.ts';
import { Game } from '../../slices/types.ts';
import { useEffect, useState } from 'react';
import TeamForm, { TeamFormData } from './TeamForm.tsx';

const Home = () => {
  const { t } = useTranslation();
  const { activeGame, fetchGames, status } = useGames();
  const [gameModalActive, setGameModalActive] = useState(false);

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
    // eslint-disable-next-line no-console
    console.log(team);
  };

  if (status === 'pending') {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        {t('global.loading')}
      </div>
    );
  }

  return (
    <Layout navBar logoutButton>
      <h1 className="mb-4 text-2xl font-bold">{t('pages.home.heading')}</h1>

      {activeGame ? (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {renderActiveGame(activeGame)}
          </h2>

          <button
            onClick={() => setGameModalActive(true)}
            className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            {t('pages.home.createTeamButton')}
          </button>

          <TeamForm
            teamSize={activeGame.teamSize}
            isOpen={gameModalActive}
            onClose={() => setGameModalActive(false)}
            createTeam={handleCreateTeam}
          />
        </div>
      ) : (
        <div>
          <p>{t('pages.home.noActiveGame')}</p>
        </div>
      )}
    </Layout>
  );
};

export default Home;
