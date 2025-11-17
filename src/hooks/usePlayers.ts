import { useSelector } from 'react-redux';

import { selectAllPlayersNormalized } from '../api/normalizedSelectors';
import type { RootState } from '../store/store';

const usePlayers = () => {
  const allPlayers = useSelector((state: RootState) =>
    selectAllPlayersNormalized(state),
  );

  return {
    allPlayers,
  };
};

export default usePlayers;
