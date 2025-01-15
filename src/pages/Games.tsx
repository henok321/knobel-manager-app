import { useState, useEffect } from 'react';
import Layout from './Layout.tsx';
import useGames from '../slices/games/hooks.ts';
import { useTranslation } from 'react-i18next';
import GameForm, { GameFormData } from './GameForm.tsx';

const Games = () => {
  const { gamesState, fetchGames } = useGames();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [gameModalActive, setGameModalActive] = useState<boolean>(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (!gamesState.fetched) {
      fetchGames();
    }
  }, [gamesState.fetched, fetchGames]);

  if (gamesState.fetching) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  const toggleGameDetails = (gameId: number) => {
    setSelectedGame(selectedGame === gameId ? null : gameId);
  };

  const handleAddGame = (formData: GameFormData) => {
    // eslint-disable-next-line no-console
    console.log(formData);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">{t('GAMES_PAGE_HEADLINE')}</h1>

        <button
          onClick={() => setGameModalActive(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Add game
        </button>

        <ul className="list-disc pl-5">
          {gamesState.games.map((game) => (
            <li key={game.id} className="mb-2">
              <div className="flex items-center justify-between">
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
                <div className="ml-4 mt-2">
                  <p>
                    <strong>{t('GAMES_PAGE_DETAILS_VIEW_STATUS')}</strong>{' '}
                    {game.status}
                  </p>
                  <p>
                    <strong>{t('GAMES_PAGE_DETAILS_VIEW_TEAM_SIZE')}</strong>
                    {game.teamSize}
                  </p>
                  <p>
                    <strong>{t('GAMES_PAGE_DETAILS_VIEW_TABLE_SIZE')}</strong>
                    {game.tableSize}
                  </p>
                  <p>
                    <strong>
                      {t('GAMES_PAGE_DETAILS_VIEW_NUMBER_OF_ROUNDS')}
                    </strong>
                    {game.numberOfRounds}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <GameForm
        isOpen={gameModalActive}
        onClose={() => {
          setGameModalActive(false);
        }}
        addGame={handleAddGame}
      />
    </Layout>
  );
};

export default Games;
