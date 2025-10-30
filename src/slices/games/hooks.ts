import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createGameAction,
  deleteGameAction,
  setupGameAction,
  updateGameAction,
} from './actions';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
  setActiveGame,
} from './slice';
import { GameCreateRequest, GameUpdateRequest } from '../../generated';
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
      dispatch(setActiveGame(gameID));
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
    activeGame,
    status,
    error,

    fetchGames,
    createGame,
    deleteGame,
    activateGame,
    updateGame,
    setupGame,
  };
};

export default useGames;
