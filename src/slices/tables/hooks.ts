import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchAllTablesForGame,
  fetchTablesForRound,
  updateScoresForTable,
} from './actions';
import { selectAllTables, selectTablesByRoundNumber } from './slice';
import { AppDispatch, RootState } from '../../store/store';

export const useTablesByRound = (gameID: number, roundNumber: number | null) =>
  useSelector((state: RootState) =>
    selectTablesByRoundNumber(state, gameID, roundNumber),
  );

const useTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tables = useSelector(selectAllTables);
  const status = useSelector((state: RootState) => state.tables.status);
  const error = useSelector((state: RootState) => state.tables.error);

  const fetchTables = useCallback(
    (gameID: number, roundNumber: number) => {
      void dispatch(fetchTablesForRound({ gameID, roundNumber }));
    },
    [dispatch],
  );

  const fetchAllTables = useCallback(
    (gameID: number, numberOfRounds: number) => {
      void dispatch(fetchAllTablesForGame({ gameID, numberOfRounds }));
    },
    [dispatch],
  );

  const updateScores = useCallback(
    (
      gameID: number,
      roundNumber: number,
      tableNumber: number,
      scores: { playerID: number; score: number }[],
    ) => {
      void dispatch(
        updateScoresForTable({ gameID, roundNumber, tableNumber, scores }),
      );
    },
    [dispatch],
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
