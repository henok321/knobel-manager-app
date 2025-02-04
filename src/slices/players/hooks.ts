import { useSelector } from 'react-redux';

import { selectAllPlayers } from './slice.ts';

const usePlayers = () => {
  const allPlayers = useSelector(selectAllPlayers);

  return {
    allPlayers,
  };
};

export default usePlayers;
