import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchTablesForRound,
  fetchAllTablesForGame,
  updateScoresForTable,
} from './actions';
import { tablesSelectors } from './slice';
import { AppDispatch, RootState } from '../../store/store';

const useTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const tables = useSelector(tablesSelectors.selectAll);
  const status = useSelector((state: RootState) => state.tables.status);
  const error = useSelector((state: RootState) => state.tables.error);

  // fetch
  const fetchTables = useCallback(
    (gameId: number, roundNumber: number) => {
      dispatch(fetchTablesForRound({ gameId, roundNumber }));
    },
    [dispatch],
  );

  const fetchAllTables = useCallback(
    (gameId: number, numberOfRounds: number) => {
      dispatch(fetchAllTablesForGame({ gameId, numberOfRounds }));
    },
    [dispatch],
  );

  const updateScores = useCallback(
    (
      gameId: number,
      roundNumber: number,
      tableNumber: number,
      scores: { playerID: number; score: number }[],
    ) => {
      dispatch(
        updateScoresForTable({ gameId, roundNumber, tableNumber, scores }),
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
