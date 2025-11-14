import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { selectAllTeamsNormalized } from '../api/normalizedSelectors';
import {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from '../api/rtkQueryApi';
import type { TeamsRequest } from '../generated';
import type { RootState } from '../store/store';

const useTeams = () => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const [updateTeamMutation] = useUpdateTeamMutation();
  const [deleteTeamMutation] = useDeleteTeamMutation();

  const createTeam = useCallback(
    async (gameID: number, teamRequest: TeamsRequest) => {
      await createTeamMutation({ gameId: gameID, teamRequest }).unwrap();
    },
    [createTeamMutation],
  );

  const updateTeam = useCallback(
    async (gameID: number, teamID: number, name: string) => {
      await updateTeamMutation({
        gameId: gameID,
        teamId: teamID,
        name,
      }).unwrap();
    },
    [updateTeamMutation],
  );

  const deleteTeam = useCallback(
    async (gameID: number, teamID: number) => {
      await deleteTeamMutation({ gameId: gameID, teamId: teamID }).unwrap();
    },
    [deleteTeamMutation],
  );

  return {
    allTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
};

export const useTeamsByIds = (teamIds: number[]) => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  return allTeams.filter((team) => teamIds.includes(team.id));
};

export default useTeams;
