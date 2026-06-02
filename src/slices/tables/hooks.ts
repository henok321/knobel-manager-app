import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../store/store';
import {
  fetchAllTablesForGame,
  fetchTablesForRound,
  updateScoresForTable,
} from './actions';
import {
  selectAllTables,
  selectTablesByGameId,
  selectTablesByRoundNumber,
  selectTablesForRoundWithSearch,
} from './slice';

export const useTablesByGameId = (gameID: number) =>
  useSelector((state: RootState) => selectTablesByGameId(state, gameID));

export const useTablesByRound = (gameID: number, roundNumber: number | null) =>
  useSelector((state: RootState) =>
    selectTablesByRoundNumber(state, gameID, roundNumber),
  );

export const useTablesForRoundWithSearch = (
  gameID: number,
  roundNumber: number,
  searchQuery: string,
) =>
  useSelector((state: RootState) =>
    selectTablesForRoundWithSearch(state, gameID, roundNumber, searchQuery),
  );

const useTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tables = useSelector(selectAllTables);
  const status = useSelector((state: RootState) => state.tables.status);
  const error = useSelector((state: RootState) => state.tables.error);

  const fetchTables = (gameID: number, roundNumber: number) => {
    void dispatch(fetchTablesForRound({ gameID, roundNumber }));
  };

  const fetchAllTables = (gameID: number, numberOfRounds: number) => {
    void dispatch(fetchAllTablesForGame({ gameID, numberOfRounds }));
  };

  const updateScores = (
    gameID: number,
    roundNumber: number,
    tableNumber: number,
    scores: { playerID: number; score: number }[],
  ) =>
    dispatch(
      updateScoresForTable({ gameID, roundNumber, tableNumber, scores }),
    );

  return {
    tables,
    status,
    error,
    fetchTables,
    fetchAllTables,
    updateScores,
  };
};

export default useTables;
