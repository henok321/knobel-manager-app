import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
import { TeamsRequest } from '../../generated';
import { AppDispatch, RootState } from '../../store/store.ts';

export const useTeamsByIds = (teamIDs: number[]) =>
  useSelector((state: RootState) => selectTeamsByIds(state, teamIDs));

export const useTeamsByGameId = (gameID: number) =>
  useSelector((state: RootState) => selectTeamsByGameId(state, gameID));

const useTeams = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allTeams = useSelector(selectAllTeams);
  const status = useSelector((state: RootState) => state.teams.status);
  const error = useSelector((state: RootState) => state.teams.error);

  const createTeam = useCallback(
    (gameID: number, teamRequest: TeamsRequest) => {
      void dispatch(createTeamAction({ gameID, teamRequest }));
    },
    [dispatch],
  );

  const updateTeam = useCallback(
    (teamID: number, name: string) => {
      void dispatch(updateTeamAction({ teamID, name }));
    },
    [dispatch],
  );

  const deleteTeam = useCallback(
    (teamID: number) => {
      void dispatch(deleteTeamAction(teamID));
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
