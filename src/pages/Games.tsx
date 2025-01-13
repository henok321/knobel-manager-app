import { useState, useEffect } from 'react';
import Layout from './Layout.tsx';
import useGames from '../slices/games/hooks.ts';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { gamesState, fetchGames } = useGames();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!gamesState.fetched) {
      fetchGames();
    }
  }, [gamesState.fetched, fetchGames]);

  if (gamesState.fetching) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  const toggleGameDetails = (gameId: number) => {
    setSelectedGame(selectedGame === gameId ? null : gameId);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">${t('GAMES_PAGE_HEADLINE')}</h1>
        <ul className="list-disc pl-5">
          {gamesState.games.map((game) => (
            <li key={game.id} className="mb-2">
              <div className="flex justify-between items-center">
                <span>{game.name}</span>
                <button
                  className="text-blue-500"
                  onClick={() => toggleGameDetails(game.id)}
                >
                  {selectedGame === game.id
                    ? t('GAMES_PAGE_HIDE_DETAILS_BUTTON')
                    : t('GAMES_PAGE_SHOW_DETAILS_BUTTON')}
                </button>
              </div>
              {selectedGame === game.id && (
                <div className="mt-2 ml-4">
                  <p>
                    <strong>Status:</strong> {game.status}
                  </p>
                  <p>
                    <strong>Team Size:</strong> {game.teamSize}
                  </p>
                  <p>
                    <strong>Table Size:</strong> {game.tableSize}
                  </p>
                  <p>
                    <strong>Number of Rounds:</strong> {game.numberOfRounds}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Home;
