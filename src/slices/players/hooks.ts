import { useDispatch, useSelector } from 'react-redux';

import { deletePlayerAction, updatePlayerAction } from './actions';
import { selectAllPlayers } from './slice';
import { AppDispatch, RootState } from '../../store/store';

const usePlayers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const allPlayers = useSelector(selectAllPlayers);
  const status = useSelector((state: RootState) => state.players.status);
  const error = useSelector((state: RootState) => state.players.error);

  const updatePlayer = (playerID: number, name: string) => {
    dispatch(updatePlayerAction({ playerID, name }));
  };

  const deletePlayer = (playerID: number) => {
    dispatch(deletePlayerAction(playerID));
  };

  return {
    allPlayers,
    updatePlayer,
    deletePlayer,
    status,
    error,
  };
};

export default usePlayers;
