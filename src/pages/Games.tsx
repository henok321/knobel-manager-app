import Layout from './Layout.tsx';
import useGames from '../slices/games/hooks.ts';
import { useEffect } from 'react';
const Home = () => {
  const { gamesState, fetchGames } = useGames();

  useEffect(() => {
    if (!gamesState.fetched) {
      fetchGames();
    }
  }, [gamesState.fetched, fetchGames]);

  if (gamesState && gamesState.fetching) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      <div>
        <h1>Games</h1>
        <p>Hello Games</p>
        <ul>
          {gamesState.games.map((game) => (
            <li key={game.id}>{game.name}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Home;
