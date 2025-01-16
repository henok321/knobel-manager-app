import { useState, useEffect } from 'react';
import Layout from '../../components/Layout.tsx';
import useGames from '../../slices/games/hooks.ts';
import { useTranslation } from 'react-i18next';
import GameForm, { GameFormData } from './GameForm.tsx';
import GameCard from './GameCard';

const Games = () => {
  const { gamesState, fetchGames, createGame } = useGames();
  const [gameModalActive, setGameModalActive] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!gamesState.fetched) {
      fetchGames();
    }
  }, [gamesState.fetched, fetchGames]);

  if (gamesState.fetching) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        {t('GAMES_PAGE_LOADING')}
      </div>
    );
  }

  const handleCreateGame = (formData: GameFormData) => {
    createGame(formData);
  };

  const handleActivateGame = (gameId: number) => {
    // eslint-disable-next-line no-console
    console.log(`Activating game with ID: ${gameId}`);
  };

  const handleDeleteGame = (gameId: number) => {
    // eslint-disable-next-line no-console
    console.log(`Deleting game with ID: ${gameId}`);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">{t('GAMES_PAGE_HEADLINE')}</h1>
        <button
          onClick={() => setGameModalActive(true)}
          className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          {t('GAMES_PAGE_CREATE_GAME_BUTTON')}
        </button>
        <div>
          {gamesState.games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onActivate={handleActivateGame}
              onDelete={handleDeleteGame}
            />
          ))}
        </div>
      </div>
      <GameForm
        isOpen={gameModalActive}
        onClose={() => setGameModalActive(false)}
        createGame={handleCreateGame}
      />
    </Layout>
  );
};

export default Games;
