import { useSelector } from 'react-redux';

import { selectAllTeamsNormalized } from '../api/normalizedSelectors';
import type { RootState } from '../store/store';

const useTeams = () => {
  const allTeams = useSelector((state: RootState) =>
    selectAllTeamsNormalized(state),
  );

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
