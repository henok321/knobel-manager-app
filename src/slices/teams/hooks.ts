import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { selectAllTeamsNormalized } from '../../api/normalizedSelectors';
import {
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useUpdateTeamMutation,
} from '../../api/rtkQueryApi';
import type { TeamsRequest } from '../../generated';
import type { RootState } from '../../store/store';

export const useTeamsByIds = (teamIds: number[]) => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );
  return allTeams.filter((team) => teamIds.includes(team.id));
};

const useTeams = () => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  // RTK Query mutations
  const [createTeamMutation, { isLoading: isCreating }] =
    useCreateTeamMutation();
  const [updateTeamMutation, { isLoading: isUpdating }] =
    useUpdateTeamMutation();
  const [deleteTeamMutation, { isLoading: isDeleting }] =
    useDeleteTeamMutation();

  const status = isCreating || isUpdating || isDeleting ? 'pending' : 'idle';

  const createTeam = useCallback(
    async (gameID: number, teamRequest: TeamsRequest) => {
      try {
        await createTeamMutation({ gameId: gameID, teamRequest }).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [createTeamMutation],
  );

  const updateTeam = useCallback(
    async (teamID: number, name: string) => {
      // Find the team to get gameID
      const team = allTeams.find((t) => t.id === teamID);
      if (!team) return;

      try {
        await updateTeamMutation({
          gameId: team.gameID,
          teamId: teamID,
          name,
        }).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [updateTeamMutation, allTeams],
  );

  const deleteTeam = useCallback(
    async (teamID: number) => {
      // Find the team to get gameID
      const team = allTeams.find((t) => t.id === teamID);
      if (!team) return;

      try {
        await deleteTeamMutation({
          gameId: team.gameID,
          teamId: teamID,
        }).unwrap();
      } catch {
        // Error handled by RTK Query
      }
    },
    [deleteTeamMutation, allTeams],
  );

  return {
    allTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    status,
    error: null,
  };
};

export default useTeams;
