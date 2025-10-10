import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
} from './actions';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
} from './slice';
import { GameCreateRequest } from '../../generated/models';
import { AppDispatch } from '../../store/store';
import { fetchAll } from '../actions';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();

  const allGames = useSelector(selectAllGames);
  const activeGame = useSelector(selectActiveGame);
  const status = useSelector(selectGamesStatus);
  const error = useSelector(selectGamesError);

  const fetchGames = useCallback(() => {
    dispatch(fetchAll());
  }, [dispatch]);

  const createGame = useCallback(
    (gameRequest: GameCreateRequest) => {
      dispatch(createGameAction(gameRequest));
    },
    [dispatch],
  );

  const deleteGame = useCallback(
    (gameID: number) => {
      dispatch(deleteGameAction(gameID));
    },
    [dispatch],
  );

  const activateGame = useCallback(
    (gameID: number) => {
      dispatch(activateGameAction(gameID));
    },
    [dispatch],
  );

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
