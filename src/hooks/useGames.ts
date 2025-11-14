import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import {
  selectAllGamesNormalized,
  selectGameByIdNormalized,
} from '../api/normalizedSelectors';
import {
  useGetGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useSetupGameMutation,
} from '../api/rtkQueryApi';
import { useActiveGame } from '../contexts/ActiveGameContext';
import type { GameCreateRequest, GameUpdateRequest } from '../generated';
import type { RootState } from '../store/store';

const useGames = () => {
  const { activeGameId, setActiveGameId } = useActiveGame();

  const { isLoading, error: queryError } = useGetGamesQuery();

  const allGames = useSelector((state: RootState) =>
    selectAllGamesNormalized(state),
  );
  const activeGame = useSelector((state: RootState) =>
    selectGameByIdNormalized(activeGameId)(state),
  );

  const [createGameMutation] = useCreateGameMutation();
  const [updateGameMutation] = useUpdateGameMutation();
  const [deleteGameMutation] = useDeleteGameMutation();
  const [setupGameMutation] = useSetupGameMutation();

  const status = isLoading ? 'pending' : queryError ? 'failed' : 'succeeded';
  const error = queryError ? new Error(String(queryError)) : null;

  const fetchGames = useCallback(() => {}, []);

  const createGame = useCallback(
    async (gameRequest: GameCreateRequest) => {
      await createGameMutation(gameRequest).unwrap();
    },
    [createGameMutation],
  );

  const deleteGame = useCallback(
    async (gameID: number) => {
      await deleteGameMutation(gameID).unwrap();
    },
    [deleteGameMutation],
  );

  const activateGame = useCallback(
    (gameID: number) => {
      setActiveGameId(gameID);
    },
    [setActiveGameId],
  );

  const updateGame = useCallback(
    async (gameID: number, gameRequest: GameUpdateRequest) => {
      await updateGameMutation({ gameId: gameID, gameRequest }).unwrap();
    },
    [updateGameMutation],
  );

  const setupGame = useCallback(
    async (gameID: number) => {
      await setupGameMutation(gameID).unwrap();
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
