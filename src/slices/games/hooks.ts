import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store.ts';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  fetchGamesAction,
} from './actions.ts';
import { GameRequest } from '../../api/types.ts';
import { GameState, selectAllGames } from './slice.ts';

const useGames = () => {
  const allGames = useSelector(selectAllGames);

  const dispatch = useDispatch<AppDispatch>();
  const gamesState = useSelector((state: { games: GameState }) => state.games);

  const fetchGames = () => {
    dispatch(fetchGamesAction());
  };

  const createGame = (gameRequest: GameRequest) => {
    dispatch(createGameAction(gameRequest));
  };

  const deleteGame = (gameID: number) => {
    dispatch(deleteGameAction(gameID));
  };

  const activateGame = (gameID: number) => {
    dispatch(activateGameAction(gameID));
  };

  return {
    gamesState,
    allGames,
    fetchGames,
    createGame,
    deleteGame,
    activateGame,
  };
};

export default useGames;
