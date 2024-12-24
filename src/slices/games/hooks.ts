import { useDispatch, useSelector } from 'react-redux';
import { GamesState } from './reducer.ts';
import { AppDispatch } from '../../store/store.ts';
import { fetchGamesAction } from './actions.ts';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gamesState = useSelector((state: { games: GamesState }) => state.games);

  const fetchGames = () => {
    dispatch(fetchGamesAction());
  };

  return { gamesState, fetchGames };
};

export default useGames;
