import React, { useCallback } from 'react';
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
} from './slice';
import { GamesContext } from '../../GamesContext.tsx';
import { GameCreateRequest, GameUpdateRequest } from '../../generated';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAll } from '../actions';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gamesContext = React.useContext(GamesContext);
  if (gamesContext === undefined) {
    throw new Error('useGamesContext must be used within a GamesProvider');
  }

  const { activeGameID, setActiveGameID, clearActiveGameID } = gamesContext;

  const allGames = useSelector(selectAllGames);
  const activeGame = useSelector((state: RootState) =>
    selectActiveGame(state, activeGameID),
  );
  const status = useSelector(selectGamesStatus);
  const error = useSelector(selectGamesError);

  const fetchGames = useCallback(() => {
    dispatch(fetchAll());
  }, [dispatch]);

  const createGame = (gameRequest: GameCreateRequest) => {
    dispatch(createGameAction(gameRequest));
  };

  const deleteGame = (gameID: number) => {
    if (activeGameID === gameID) {
      clearActiveGameID();
    }
    dispatch(deleteGameAction(gameID));
  };

  const activateGame = (gameID: number) => {
    setActiveGameID(gameID);
  };

  const updateGame = (gameID: number, gameRequest: GameUpdateRequest) => {
    dispatch(updateGameAction({ gameID, gameRequest }));
  };

  const setupGame = (gameID: number) => dispatch(setupGameAction(gameID));

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
    clearActiveGameID,
  };
};

export default useGames;
