import { useState, useEffect } from 'react';
import Layout from './Layout.tsx';
import useGames from '../slices/games/hooks.ts';

const Home = () => {
  const { gamesState, fetchGames } = useGames();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

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
        <h1 className="text-2xl font-bold mb-4">Games</h1>
        <ul className="list-disc pl-5">
          {gamesState.games.map((game) => (
            <li key={game.id} className="mb-2">
              <div className="flex justify-between items-center">
                <span>{game.name}</span>
                <button
                  className="text-blue-500"
                  onClick={() => toggleGameDetails(game.id)}
                >
                  {selectedGame === game.id ? 'Hide Details' : 'Show Details'}
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
                  <div>
                    <h3 className="font-semibold">Owners:</h3>
                    <ul className="list-disc pl-5">
                      {game.owners.map((owner) => (
                        <li key={owner.ownerSub}>{owner.ownerSub}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Teams:</h3>
                    <ul className="list-disc pl-5">
                      {game.teams.map((team) => (
                        <li key={team.id}>{team.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Rounds:</h3>
                    <ul className="list-disc pl-5">
                      {game.rounds.map((round) => (
                        <li key={round.id}>Round {round.roundNumber}</li>
                      ))}
                    </ul>
                  </div>
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
