import { useState, useEffect } from 'react';
import useGames from '../../slices/games/hooks.ts';
import { useTranslation } from 'react-i18next';
import GameForm, { GameFormData } from './GameForm.tsx';
import GameCard from './GameCard';
import Layout from '../../components/Layout.tsx';

const Games = () => {
  const {
    status,
    error,
    allGames,
    activeGame,
    fetchGames,
    createGame,
    activateGame,
    deleteGame,
  } = useGames();

  const [gameModalActive, setGameModalActive] = useState(false);
  const { t } = useTranslation();

  // Fetch games if status is idle
  useEffect(() => {
    if (status === 'idle') {
      fetchGames();
    }
  }, [status, fetchGames]);

  // === DERIVED BOOLEANS ===
  const isLoading = status === 'idle' || status === 'pending';
  const hasError = status === 'failed' && error;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        {t('global.loading')}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-xl text-red-500">
        <p>{t('global.errorOccurred')}</p>
        <p>{error?.message}</p>
      </div>
    );
  }

  const handleCreateGame = (formData: GameFormData) => {
    createGame(formData);
  };

  const handleActivateGame = (gameID: number) => {
    activateGame(gameID);
  };

  const handleDeleteGame = (gameID: number) => {
    deleteGame(gameID);
  };

  return (
    <Layout navBar logoutButton>
      <div>
        <h1 className="mb-4 text-2xl font-bold">{t('pages.games.heading')}</h1>
        <button
          onClick={() => setGameModalActive(true)}
          className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          {t('pages.games.createGameButton')}
        </button>

        <div>
          {allGames.map((game) => (
            <GameCard
              key={game.id}
              isActiveGame={game.id === activeGame?.id}
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
