import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchAllTablesForGame,
  fetchTablesForRound,
  updateScoresForTable,
} from './actions';
import { selectAllTables, selectTablesByRoundNumber } from './slice';
import { AppDispatch, RootState } from '../../store/store';

export const useTablesByRound = (roundNumber: number | null) =>
  useSelector((state: RootState) =>
    selectTablesByRoundNumber(state, roundNumber),
  );

const useTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tables = useSelector(selectAllTables);
  const status = useSelector((state: RootState) => state.tables.status);
  const error = useSelector((state: RootState) => state.tables.error);

  const fetchTables = (gameId: number, roundNumber: number) => {
    dispatch(fetchTablesForRound({ gameId, roundNumber }));
  };

  const fetchAllTables = useCallback(
    (gameId: number, numberOfRounds: number) => {
      dispatch(fetchAllTablesForGame({ gameId, numberOfRounds }));
    },
    [dispatch],
  );

  const updateScores = (
    gameId: number,
    roundNumber: number,
    tableNumber: number,
    scores: { playerID: number; score: number }[],
  ) => {
    dispatch(
      updateScoresForTable({ gameId, roundNumber, tableNumber, scores }),
    );
  };

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
