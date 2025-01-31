import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout.tsx';
import useGames from '../slices/games/hooks.ts';
import { Game } from '../slices/types.ts';
import { useEffect } from 'react';

const Home = () => {
  const { t } = useTranslation();
  const { activeGame, fetchGames, status } = useGames();

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

  return (
    <Layout navBar logoutButton>
      <div>
        <h1 className="mb-4 text-2xl font-bold">{t('pages.home.heading')}</h1>
        {activeGame && renderActiveGame(activeGame)}
      </div>
    </Layout>
  );
};

export default Home;
