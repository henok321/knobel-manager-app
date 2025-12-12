import { createAsyncThunk } from '@reduxjs/toolkit';

import { client } from '../../api/apiClient';
import { extractResponseData } from '../../api/responseUtils';
import { getTables, updateScores, type Table } from '../../generated';
import i18n from '../../i18n/i18nConfig';

export const fetchTablesForRound = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; roundNumber: number }
>('tables/fetchForRound', async ({ gameId, roundNumber }) => {
  try {
    const response = await getTables({
      path: { gameID: gameId, roundNumber },
      client,
    });
    return extractResponseData(response).tables.map((table) => ({
      ...table,
      roundNumber,
    }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.table.fetch');
    throw new Error(message);
  }
});

export const fetchAllTablesForGame = createAsyncThunk<
  (Table & { roundNumber: number })[],
  { gameId: number; numberOfRounds: number }
>('tables/fetchAllForGame', async ({ gameId, numberOfRounds }) => {
  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : i18n.t('apiError.table.fetch');
    throw new Error(message);
  }
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
    try {
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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : i18n.t('apiError.table.update');
      throw new Error(message);
    }
  },
);
