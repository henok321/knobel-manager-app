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

  const createTeam = (gameID: number, teamRequest: TeamsRequest) => {
    dispatch(createTeamAction({ gameID, teamRequest }));
  };

  const updateTeam = (teamID: number, name: string) => {
    dispatch(updateTeamAction({ teamID, name }));
  };

  const deleteTeam = (teamID: number) => {
    dispatch(deleteTeamAction(teamID));
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
