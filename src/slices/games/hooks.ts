import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setActiveGame } from './slice';
import {
  selectAllGamesNormalized,
  selectGameByIdNormalized,
} from '../../api/normalizedSelectors';
import {
  useGetGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useSetupGameMutation,
} from '../../api/rtkQueryApi';
import type { GameCreateRequest, GameUpdateRequest } from '../../generated';
import type { RootState } from '../../store/store';

const useGames = () => {
  const dispatch = useDispatch();

  // RTK Query for fetching games
  const { isLoading, error: queryError } = useGetGamesQuery();

  // Normalized selectors
  const allGames = useSelector((state: RootState) =>
    selectAllGamesNormalized(state),
  );
  const activeGameId = useSelector(
    (state: RootState) => state.games.activeGameID,
  );
  const activeGame = useSelector((state: RootState) =>
    selectGameByIdNormalized(activeGameId)(state),
  );

  // RTK Query mutations
  const [createGameMutation] = useCreateGameMutation();
  const [updateGameMutation] = useUpdateGameMutation();
  const [deleteGameMutation] = useDeleteGameMutation();
  const [setupGameMutation] = useSetupGameMutation();

  // Convert loading state to status string for backward compatibility
  const status = isLoading ? 'pending' : queryError ? 'failed' : 'succeeded';
  const error = queryError ? new Error(String(queryError)) : null;

  // No-op for fetchGames since RTK Query auto-fetches
  const fetchGames = useCallback(() => {
    // RTK Query handles fetching automatically
  }, []);

  const createGame = useCallback(
    async (gameRequest: GameCreateRequest) => {
      try {
        await createGameMutation(gameRequest).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [createGameMutation],
  );

  const deleteGame = useCallback(
    async (gameID: number) => {
      try {
        await deleteGameMutation(gameID).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [deleteGameMutation],
  );

  const activateGame = useCallback(
    (gameID: number) => {
      dispatch(setActiveGame(gameID));
    },
    [dispatch],
  );

  const updateGame = useCallback(
    async (gameID: number, gameRequest: GameUpdateRequest) => {
      try {
        await updateGameMutation({ gameId: gameID, gameRequest }).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [updateGameMutation],
  );

  const setupGame = useCallback(
    async (gameID: number) => {
      try {
        await setupGameMutation(gameID).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [setupGameMutation],
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
