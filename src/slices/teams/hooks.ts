import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createTeamAction,
  deleteTeamAction,
  updateTeamAction,
} from './actions.ts';
import { selectAllTeams, selectTeamsByIds } from './slice.ts';
import { TeamsRequest } from '../../generated';
import { AppDispatch, RootState } from '../../store/store.ts';

export const useTeamsByIds = (teamIds: number[]) =>
  useSelector((state: RootState) => selectTeamsByIds(state, teamIds));

const useTeams = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allTeams = useSelector(selectAllTeams);
  const status = useSelector((state: RootState) => state.teams.status);
  const error = useSelector((state: RootState) => state.teams.error);

  const createTeam = useCallback(
    (gameID: number, teamRequest: TeamsRequest) => {
      dispatch(createTeamAction({ gameID, teamRequest }));
    },
    [dispatch],
  );

  const updateTeam = useCallback(
    (teamID: number, name: string) => {
      dispatch(updateTeamAction({ teamID, name }));
    },
    [dispatch],
  );

  const deleteTeam = useCallback(
    (teamID: number) => {
      dispatch(deleteTeamAction(teamID));
    },
    [dispatch],
  );

  return {
    allTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    status,
    error,
  };
};

export default useTeams;
