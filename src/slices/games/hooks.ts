import { useDispatch, useSelector } from 'react-redux';
import { GamesState } from './reducer.ts';
import { AppDispatch } from '../../store/store.ts';
import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  fetchGamesAction,
} from './actions.ts';
import { GameRequest } from '../../api/apiClient.ts';

const useGames = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gamesState = useSelector((state: { games: GamesState }) => state.games);

  const fetchGames = () => {
    dispatch(fetchGamesAction());
  };

  const createGame = (gameRequest: GameRequest) => {
    dispatch(createGameAction(gameRequest));
  };

  const deleteGame = (gameID: number) => {
    dispatch(deleteGameAction(gameID));
  };

  const activateGame = (gameID: number) => {
    dispatch(activateGameAction(gameID));
  };

  return { gamesState, fetchGames, createGame, deleteGame, activateGame };
};

export default useGames;
