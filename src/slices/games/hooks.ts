import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createGameAction,
  deleteGameAction,
  setupGameAction,
  updateGameAction,
} from './actions';
import { selectAllGames, selectGamesError, selectGamesStatus } from './slice';
import { GameCreateRequest, GameUpdateRequest } from '../../generated';
import { AppDispatch } from '../../store/store';
import { fetchAll } from '../actions';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();

  const allGames = useSelector(selectAllGames);

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

  const updateGame = useCallback(
    (gameID: number, gameRequest: GameUpdateRequest) => {
      dispatch(updateGameAction({ gameID, gameRequest }));
    },
    [dispatch],
  );

  const setupGame = useCallback(
    (gameID: number) => dispatch(setupGameAction(gameID)),
    [dispatch],
  );

  return {
    allGames,
    status,
    error,

    fetchGames,
    createGame,
    deleteGame,
    updateGame,
    setupGame,
  };
};

export default useGames;
