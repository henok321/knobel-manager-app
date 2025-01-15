import { useState, useEffect, FormEvent } from 'react';
import Layout from './Layout.tsx';
import useGames from '../slices/games/hooks.ts';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal.tsx';

interface GameForm {
  name: string;
  teamSize: number;
  tableSize: number;
  numberOfRounds: number;
}

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

  const handleAddGame = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const game = {
      name: formData.get('name') as string,
      teamSize: Number(formData.get('teamSize')),
      tableSize: Number(formData.get('tableSize')),
      numberOfRounds: Number(formData.get('numberOfRounds')),
    } as GameForm;
    // eslint-disable-next-line no-console
    console.log(game);
    setGameModalActive(false);
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

      <Modal isOpen={gameModalActive} onClose={() => setGameModalActive(false)}>
        <div>
          <h2 className="mb-4 text-xl font-bold">Add Game</h2>
          <form onSubmit={handleAddGame} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Game Name
              </label>
              <input
                type="text"
                name="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Team Size
              </label>
              <input
                type="number"
                name="teamSize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Table Size
              </label>
              <input
                type="number"
                name="tableSize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Rounds
              </label>
              <input
                type="number"
                name="numberOfRounds"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Create Game
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </Layout>
  );
};

export default Games;
