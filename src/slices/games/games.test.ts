/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import {
  activateGameAction,
  createGameAction,
  deleteGameAction,
  setupGameAction,
  updateGameAction,
} from './actions';
import {
  selectActiveGame,
  selectAllGames,
  selectGamesError,
  selectGamesStatus,
} from './slice';
import { server } from '../../test/setup/msw';
import { createTestStore } from '../../test/setup/store';

describe('Games Actions + Slice', () => {
  describe('createGameAction', () => {
    it('should create game and update state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const state = store.getState();
      const games = selectAllGames(state);

      expect(games).toHaveLength(1);
      expect(games[0]?.name).toBe('Test Game');
      expect(games[0]?.teamSize).toBe(3);
      expect(games[0]?.tableSize).toBe(4);
      expect(games[0]?.numberOfRounds).toBe(5);
      expect(games[0]?.status).toBe('setup');
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.post(
          'http://localhost/api/games',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });

    it('should transition status idle → pending → succeeded', async () => {
      const store = createTestStore();
      expect(selectGamesStatus(store.getState())).toBe('idle');

      const promise = store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      expect(selectGamesStatus(store.getState())).toBe('pending');

      await promise;

      expect(selectGamesStatus(store.getState())).toBe('succeeded');
    });
  });

  describe('updateGameAction', () => {
    it('should update game in state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Original Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();

      await store.dispatch(
        updateGameAction({
          gameID: gameID!,
          gameRequest: {
            name: 'Updated Game',
            teamSize: 3,
            tableSize: 4,
            numberOfRounds: 5,
            status: 'setup',
          },
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);

      expect(updatedGames).toHaveLength(1);
      expect(updatedGames[0]?.name).toBe('Updated Game');
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:id',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        updateGameAction({
          gameID: 1,
          gameRequest: {
            name: 'Updated Game',
            teamSize: 3,
            tableSize: 4,
            numberOfRounds: 5,
            status: 'setup',
          },
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('deleteGameAction', () => {
    it('should remove game from state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Game to Delete',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(games).toHaveLength(1);
      expect(gameID).toBeDefined();

      await store.dispatch(deleteGameAction(gameID!));

      const state = store.getState();
      const remainingGames = selectAllGames(state);

      expect(remainingGames).toHaveLength(0);
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.delete(
          'http://localhost/api/games/:id',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(deleteGameAction(1));

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('activateGameAction', () => {
    it('should set activeGameID', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Game to Activate',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();
      expect(selectActiveGame(store.getState())).toBeUndefined();

      await store.dispatch(activateGameAction(gameID!));

      const state = store.getState();
      const activeGame = selectActiveGame(state);

      expect(activeGame).toBeDefined();
      expect(activeGame?.id).toBe(gameID);
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.post(
          'http://localhost/api/games/:id/activate',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(activateGameAction(1));

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('setupGameAction', () => {
    it('should setup game and update state with rounds', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Game to Setup',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();
      expect(games[0]?.rounds).toEqual([]);
      expect(games[0]?.status).toBe('setup');

      await store.dispatch(setupGameAction(gameID!));

      const state = store.getState();
      const updatedGames = selectAllGames(state);

      expect(updatedGames).toHaveLength(1);
      expect(updatedGames[0]?.id).toBe(gameID);
      expect(updatedGames[0]?.rounds).toBeDefined();
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.post(
          'http://localhost/api/games/:id/setup',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(setupGameAction(1));

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });

    it('should transition status idle → pending → succeeded', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Game to Setup',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();
      expect(selectGamesStatus(store.getState())).toBe('succeeded');

      const promise = store.dispatch(setupGameAction(gameID!));

      expect(selectGamesStatus(store.getState())).toBe('pending');

      await promise;

      expect(selectGamesStatus(store.getState())).toBe('succeeded');
    });
  });
});
