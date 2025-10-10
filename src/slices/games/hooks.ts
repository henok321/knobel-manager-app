import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  updateGameAction,
} from './actions';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
} from './slice';
import { GameCreateRequest, GameUpdateRequest } from '../../generated/models';
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

  const updateGame = useCallback(
    (gameID: number, gameRequest: GameUpdateRequest) => {
      dispatch(updateGameAction({ gameID, gameRequest }));
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
    updateGame,
  };
};

export default useGames;
