import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createGameAction,
  createTeamAction,
  deleteGameAction,
  deletePlayerAction,
  deleteTeamAction,
  fetchAll,
  fetchAllTablesForGame,
  fetchTablesForRound,
  setupGameAction,
  updateGameAction,
  updatePlayerAction,
  updateScoresForTable,
  updateTeamAction,
} from './slice';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
} from './slice';
import { GamesContext } from '../../GamesContext.tsx';
import {
  GameCreateRequest,
  GameUpdateRequest,
  TeamsRequest,
} from '../../generated';
import { AppDispatch, RootState } from '../../store/store';

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

  const createGame = useCallback(
    (gameRequest: GameCreateRequest) => {
      dispatch(createGameAction(gameRequest));
    },
    [dispatch],
  );

  const deleteGame = useCallback(
    (gameID: number) => {
      if (activeGameID === gameID) {
        clearActiveGameID();
      }
      dispatch(deleteGameAction(gameID));
    },
    [dispatch, activeGameID, clearActiveGameID],
  );

  const activateGame = useCallback(
    (gameID: number) => {
      setActiveGameID(gameID);
    },
    [setActiveGameID],
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

  const createTeam = useCallback(
    (gameID: number, teamRequest: TeamsRequest) => {
      dispatch(createTeamAction({ gameID, teamRequest }));
    },
    [dispatch],
  );

  const updateTeam = useCallback(
    (gameID: number, teamID: number, name: string) => {
      dispatch(updateTeamAction({ gameID, teamID, teamRequest: { name } }));
    },
    [dispatch],
  );

  const deleteTeam = useCallback(
    (gameID: number, teamID: number) => {
      dispatch(deleteTeamAction({ gameID, teamID }));
    },
    [dispatch],
  );

  const updatePlayer = useCallback(
    (gameID: number, teamID: number, playerID: number, name: string) => {
      dispatch(
        updatePlayerAction({
          gameID,
          teamID,
          playerID,
          playerRequest: { name },
        }),
      );
    },
    [dispatch],
  );

  const deletePlayer = useCallback(
    (gameID: number, teamID: number, playerID: number) => {
      dispatch(deletePlayerAction({ gameID, teamID, playerID }));
    },
    [dispatch],
  );

  const fetchTables = useCallback(
    (gameID: number, roundNumber: number) => {
      dispatch(fetchTablesForRound({ gameID, roundNumber }));
    },
    [dispatch],
  );

  const fetchAllTables = useCallback(
    (gameID: number, numberOfRounds: number) => {
      dispatch(fetchAllTablesForGame({ gameID, numberOfRounds }));
    },
    [dispatch],
  );

  const updateScores = useCallback(
    (
      gameID: number,
      roundNumber: number,
      tableNumber: number,
      scores: { playerID: number; score: number }[],
    ) => {
      dispatch(
        updateScoresForTable({ gameID, roundNumber, tableNumber, scores }),
      );
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
    setupGame,
    clearActiveGameID,

    createTeam,
    updateTeam,
    deleteTeam,

    updatePlayer,
    deletePlayer,

    fetchTables,
    fetchAllTables,
    updateScores,
  };
};

export default useGames;
