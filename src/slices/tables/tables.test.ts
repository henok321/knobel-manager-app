/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import {
  fetchTablesForRound,
  fetchAllTablesForGame,
  updateScoresForTable,
} from './actions';
import {
  selectAllTables,
  selectTablesError,
  selectTablesStatus,
} from './slice';
import { server } from '../../test/setup/msw';
import { createTestStore } from '../../test/setup/store';

describe('Tables Actions + Slice', () => {
  describe('fetchTablesForRound', () => {
    it('should fetch tables and update state', async () => {
      const store = createTestStore();

      await store.dispatch(
        fetchTablesForRound({
          gameId: 1,
          roundNumber: 1,
        }),
      );

      const state = store.getState();
      const tables = selectAllTables(state);

      expect(tables).toHaveLength(2);
      expect(tables[0]?.roundID).toBe(1);
      expect(tables[0]?.tableNumber).toBe(1);
      expect(tables[1]?.tableNumber).toBe(2);
      expect(selectTablesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(
          'http://localhost/api/games/:gameId/rounds/:roundNumber/tables',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        fetchTablesForRound({
          gameId: 1,
          roundNumber: 1,
        }),
      );

      const state = store.getState();
      expect(selectTablesStatus(state)).toBe('failed');
      expect(selectTablesError(state)).toBeDefined();
    });

    it('should transition status idle → pending → succeeded', async () => {
      const store = createTestStore();
      expect(selectTablesStatus(store.getState())).toBe('idle');

      const promise = store.dispatch(
        fetchTablesForRound({
          gameId: 1,
          roundNumber: 1,
        }),
      );

      expect(selectTablesStatus(store.getState())).toBe('pending');

      await promise;

      expect(selectTablesStatus(store.getState())).toBe('succeeded');
    });
  });

  describe('fetchAllTablesForGame', () => {
    it('should fetch tables for all rounds', async () => {
      const store = createTestStore();

      await store.dispatch(
        fetchAllTablesForGame({
          gameId: 1,
          numberOfRounds: 3,
        }),
      );

      const state = store.getState();
      const tables = selectAllTables(state);

      expect(tables).toHaveLength(6);
      expect(tables.filter((t) => t.roundID === 1)).toHaveLength(2);
      expect(tables.filter((t) => t.roundID === 2)).toHaveLength(2);
      expect(tables.filter((t) => t.roundID === 3)).toHaveLength(2);
      expect(selectTablesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(
          'http://localhost/api/games/:gameId/rounds/:roundNumber/tables',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        fetchAllTablesForGame({
          gameId: 1,
          numberOfRounds: 2,
        }),
      );

      const state = store.getState();
      expect(selectTablesStatus(state)).toBe('failed');
      expect(selectTablesError(state)).toBeDefined();
    });

    it('should transition status idle → pending → succeeded', async () => {
      const store = createTestStore();
      expect(selectTablesStatus(store.getState())).toBe('idle');

      const promise = store.dispatch(
        fetchAllTablesForGame({
          gameId: 1,
          numberOfRounds: 2,
        }),
      );

      expect(selectTablesStatus(store.getState())).toBe('pending');

      await promise;

      expect(selectTablesStatus(store.getState())).toBe('succeeded');
    });
  });

  describe('updateScoresForTable', () => {
    it('should update scores and refresh tables', async () => {
      const store = createTestStore();

      await store.dispatch(
        fetchTablesForRound({
          gameId: 1,
          roundNumber: 1,
        }),
      );

      expect(selectAllTables(store.getState())).toHaveLength(2);

      await store.dispatch(
        updateScoresForTable({
          gameId: 1,
          roundNumber: 1,
          tableNumber: 1,
          scores: [
            { playerID: 1, score: 10 },
            { playerID: 2, score: 20 },
          ],
        }),
      );

      const state = store.getState();
      const tables = selectAllTables(state);

      expect(tables).toHaveLength(2);
      expect(selectTablesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:gameId/rounds/:roundNumber/tables/:tableNumber/scores',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        updateScoresForTable({
          gameId: 1,
          roundNumber: 1,
          tableNumber: 1,
          scores: [{ playerID: 1, score: 10 }],
        }),
      );

      const state = store.getState();
      expect(selectTablesStatus(state)).toBe('failed');
      expect(selectTablesError(state)).toBeDefined();
    });

    it('should upsert tables after update', async () => {
      const store = createTestStore();

      await store.dispatch(
        fetchTablesForRound({
          gameId: 1,
          roundNumber: 1,
        }),
      );

      const initialTables = selectAllTables(store.getState());
      expect(initialTables).toHaveLength(2);

      await store.dispatch(
        updateScoresForTable({
          gameId: 1,
          roundNumber: 1,
          tableNumber: 1,
          scores: [{ playerID: 1, score: 10 }],
        }),
      );

      const state = store.getState();
      const updatedTables = selectAllTables(state);

      expect(updatedTables).toHaveLength(2);
      expect(updatedTables[0]?.id).toBe(initialTables[0]?.id);
    });
  });
});
