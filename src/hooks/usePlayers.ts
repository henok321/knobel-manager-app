import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { selectAllPlayersNormalized } from '../api/normalizedSelectors';
import {
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} from '../api/rtkQueryApi';
import type { RootState } from '../store/store';

const usePlayers = () => {
  const allPlayers = useSelector((state: RootState) =>
    selectAllPlayersNormalized(state),
  );

  const [updatePlayerMutation] = useUpdatePlayerMutation();
  const [deletePlayerMutation] = useDeletePlayerMutation();

  const updatePlayer = useCallback(
    async (gameID: number, teamID: number, playerID: number, name: string) => {
      await updatePlayerMutation({
        gameId: gameID,
        teamId: teamID,
        playerId: playerID,
        playersRequest: { name },
      }).unwrap();
    },
    [updatePlayerMutation],
  );

  const deletePlayer = useCallback(
    async (gameID: number, teamID: number, playerID: number) => {
      try {
        await deletePlayerMutation({
          gameId: gameID,
          teamId: teamID,
          playerId: playerID,
        }).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [deletePlayerMutation],
  );

  return {
    allPlayers,
  };
};

export default usePlayers;
