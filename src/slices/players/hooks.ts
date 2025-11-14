import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import {
  selectAllPlayersNormalized,
  selectAllTeamsNormalized,
} from '../../api/normalizedSelectors';
import {
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} from '../../api/rtkQueryApi';
import type { RootState } from '../../store/store';

const usePlayers = () => {
  const allPlayers = useSelector((state: RootState) =>
    selectAllPlayersNormalized(state),
  );
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  const [updatePlayerMutation] = useUpdatePlayerMutation();
  const [deletePlayerMutation] = useDeletePlayerMutation();

  const updatePlayer = useCallback(
    async (playerID: number, name: string) => {
      const player = allPlayers.find((p) => p.id === playerID);
      if (!player) return;

      const team = allTeams.find((t) => t.id === player.teamID);
      if (!team) return;

      await updatePlayerMutation({
        gameId: team.gameID,
        teamId: team.id,
        playerId: playerID,
        name,
      }).unwrap();
    },
    [updatePlayerMutation, allPlayers, allTeams],
  );

  const deletePlayer = useCallback(
    async (playerID: number) => {
      const player = allPlayers.find((p) => p.id === playerID);
      if (!player) return;

      const team = allTeams.find((t) => t.id === player.teamID);
      if (!team) return;

      await deletePlayerMutation({
        gameId: team.gameID,
        teamId: team.id,
        playerId: playerID,
      }).unwrap();
    },
    [deletePlayerMutation, allPlayers, allTeams],
  );

  return {
    allPlayers,
    updatePlayer,
    deletePlayer,
  };
};

export default usePlayers;
