import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
} from './actions';
import { GameRequest } from '../../api/types';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
} from './slice';
import { fetchAll } from '../actions';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();

  const allGames = useSelector(selectAllGames);
  const activeGame = useSelector(selectActiveGame);
  const status = useSelector(selectGamesStatus);
  const error = useSelector(selectGamesError);

  const fetchGames = () => {
    dispatch(fetchAll());
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
    allGames,
    activeGame,
    status,
    error,

    fetchGames,
    createGame,
    deleteGame,
    activateGame,
  };
};

export default useGames;
