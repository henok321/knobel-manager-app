import { useDispatch, useSelector } from 'react-redux';

import { createTeamAction } from './actions.ts';
import { selectAllTeams } from './slice.ts';
import { TeamRequest } from '../../api/types.ts';
import { AppDispatch } from '../../store/store.ts';

const useTeams = () => {
  const dispatch = useDispatch<AppDispatch>();

  const allTeams = useSelector(selectAllTeams);
  const createTeam = (gameID: number, teamRequest: TeamRequest) => {
    dispatch(createTeamAction({ gameID, teamRequest }));
  };

  return { allTeams, createTeam };
};

export default useTeams;
