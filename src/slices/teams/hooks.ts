import { useDispatch, useSelector } from 'react-redux';

import { createTeamAction } from './actions.ts';
import { selectTeamsByGameId } from './slice.ts';
import { TeamRequest } from '../../api/types.ts';
import { AppDispatch, RootState } from '../../store/store.ts';

const useTeams = () => {
  const dispatch = useDispatch<AppDispatch>();

  const createTeam = (gameID: number, teamRequest: TeamRequest) => {
    dispatch(createTeamAction({ gameID, teamRequest }));
  };

  return { createTeam };
};

export const useTeamsByGameId = (gameID: number) =>
  useSelector((state: RootState) => selectTeamsByGameId(state, gameID));

export default useTeams;
