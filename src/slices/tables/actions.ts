import { createAsyncThunk } from '@reduxjs/toolkit';

import { scoresApi, tablesApi } from '../../api/apiClient';
import { Table } from '../../generated';

export const fetchTablesForRound = createAsyncThunk<
  Table[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  const response = await tablesApi.getTables(gameId, roundNumber);
  return response.data;
});

export const updateScoresForTable = createAsyncThunk<
  Table[],
  {
    gameId: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'tables/updateScores',
  async ({ gameId, roundNumber, tableNumber, scores }) => {
    await scoresApi.updateScores(gameId, roundNumber, tableNumber, { scores });

    const response = await tablesApi.getTables(gameId, roundNumber);
    return response.data;
  },
);
