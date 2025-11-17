import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { selectAllTeamsNormalized } from '../api/normalizedSelectors';
import {
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from '../api/rtkQueryApi';
import type { TeamsRequest } from '../generated/api';
import type { RootState } from '../store/store';

const useTeams = () => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const [updateTeamMutation] = useUpdateTeamMutation();
  const [deleteTeamMutation] = useDeleteTeamMutation();





























  return {
    allTeams,
  };
};

export const useTeamsByIds = (teamIds: number[]) => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

  return allTeams.filter((team) => teamIds.includes(team.id));
};

export default useTeams;
