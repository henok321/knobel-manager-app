import { useDispatch, useSelector } from 'react-redux';

import type { TeamsRequest } from '../../generated';
import type { AppDispatch, RootState } from '../../store/store.ts';
import {
  createTeamAction,
  deleteTeamAction,
  updateTeamAction,
} from './actions.ts';
import {
  selectAllTeams,
  selectTeamsByGameId,
  selectTeamsByIds,
} from './slice.ts';

export const useTeamsByIds = (teamIDs: number[]) =>
  useSelector((state: RootState) => selectTeamsByIds(state, teamIDs));

export const useTeamsByGameId = (gameID: number) =>
  useSelector((state: RootState) => selectTeamsByGameId(state, gameID));

const useTeams = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allTeams = useSelector(selectAllTeams);
  const status = useSelector((state: RootState) => state.teams.status);
  const error = useSelector((state: RootState) => state.teams.error);

  const createTeam = (gameID: number, teamRequest: TeamsRequest) => {
    void dispatch(createTeamAction({ gameID, teamRequest }));
  };

  const updateTeam = (teamID: number, name: string) => {
    void dispatch(updateTeamAction({ teamID, name }));
  };

  const deleteTeam = (teamID: number) => {
    void dispatch(deleteTeamAction(teamID));
  };

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
