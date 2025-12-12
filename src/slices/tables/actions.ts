import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { extractResponseData } from '../../api/responseUtils';
import { getTables, updateScores, type Table } from '../../generated';

export const fetchTablesForRound = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  const response = await getTables({
    path: { gameID: gameId, roundNumber },
    client,
  });
  return extractResponseData(response).tables.map((table) => ({
    ...table,
    roundNumber,
  }));
});

export const fetchAllTablesForGame = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; numberOfRounds: number }
>('tables/fetchAllForGame', async ({ gameId, numberOfRounds }) => {
  const allTables: (Table & { roundNumber: number })[] = [];

  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const response = await getTables({
      path: { gameID: gameId, roundNumber: roundNum },
      client,
    });
    const tablesWithRoundNumber = extractResponseData(response).tables.map(
      (table) => ({
        ...table,
        roundNumber: roundNum,
      }),
    );
    allTables.push(...tablesWithRoundNumber);
  }

  return allTables;
});

export const updateScoresForTable = createAsyncThunk<
  (Table & { roundNumber: number })[],
  {
    gameId: number;
    roundNumber: number;
    tableNumber: number;
    scores: { playerID: number; score: number }[];
  }
>(
  'tables/updateScores',
  async ({ gameId, roundNumber, tableNumber, scores }) => {
    await updateScores({
      path: { gameID: gameId, roundNumber, tableNumber },
      body: { scores },
      client,
    });

    const response = await getTables({
      path: { gameID: gameId, roundNumber },
      client,
    });
    return extractResponseData(response).tables.map((table) => ({
      ...table,
      roundNumber,
    }));
  },
);
