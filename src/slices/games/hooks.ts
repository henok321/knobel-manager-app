import { useDispatch, useSelector } from 'react-redux';

import type { GameCreateRequest, GameUpdateRequest } from '../../generated';
import type { AppDispatch } from '../../store/store';
import { fetchAll } from '../actions';
import {
  createGameAction,
  deleteGameAction,
  setupGameAction,
  updateGameAction,
} from './actions';
import { selectAllGames, selectGamesError, selectGamesStatus } from './slice';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();

  const allGames = useSelector(selectAllGames);

  const status = useSelector(selectGamesStatus);
  const error = useSelector(selectGamesError);

  const fetchGames = () => {
    void dispatch(fetchAll());
  };

  const createGame = (gameRequest: GameCreateRequest) => {
    void dispatch(createGameAction(gameRequest));
  };

  const deleteGame = (gameID: number) => {
    void dispatch(deleteGameAction(gameID));
  };

  const updateGame = (gameID: number, gameRequest: GameUpdateRequest) => {
    void dispatch(updateGameAction({ gameID, gameRequest }));
  };

  const setupGame = (gameID: number) => dispatch(setupGameAction(gameID));

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
