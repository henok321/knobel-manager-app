/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import { updatePlayerAction, deletePlayerAction } from './actions';
import { selectAllPlayers } from './slice';
import { server } from '../../test/setup/msw';
import { createTestStore } from '../../test/setup/store';
import { createTeamAction } from '../teams/actions';

describe('Players Actions + Slice', () => {
  describe('updatePlayerAction', () => {
    it('should update player in state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
            players: [{ name: 'Original Player' }],
          },
        }),
      );

      const players = selectAllPlayers(store.getState());
      const playerID = players[0]?.id;

      expect(playerID).toBeDefined();

      await store.dispatch(
        updatePlayerAction({
          playerID: playerID!,
          name: 'Updated Player',
        }),
      );

      const state = store.getState();
      const updatedPlayers = selectAllPlayers(state);

      expect(updatedPlayers).toHaveLength(1);
      expect(updatedPlayers[0]?.name).toBe('Updated Player');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:gameID/teams/:teamID/players/:playerID',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
            players: [{ name: 'Test Player' }],
          },
        }),
      );

      const players = selectAllPlayers(store.getState());
      const playerID = players[0]?.id;

      await store.dispatch(
        updatePlayerAction({
          playerID: playerID!,
          name: 'Updated Player',
        }),
      );

      const state = store.getState();
      expect(state.players.status).toBe('failed');
    });

    it('should handle player not found error', async () => {
      const store = createTestStore();

      const result = await store.dispatch(
        updatePlayerAction({
          playerID: 999,
          name: 'Updated Player',
        }),
      );

      expect(result.type).toBe('players/updatePlayer/rejected');
      expect(result.meta.requestStatus).toBe('rejected');
      expect('error' in result && result.error.message).toContain(
        'Player with ID 999 not found',
      );
    });

    it('should handle team not found error', async () => {
      const store = createTestStore({
        players: {
          ids: [1],
          entities: {
            1: { id: 1, name: 'Test Player', teamID: 999 },
          },
          status: 'idle',
          error: null,
        },
      });

      const result = await store.dispatch(
        updatePlayerAction({
          playerID: 1,
          name: 'Updated Player',
        }),
      );

      expect(result.type).toBe('players/updatePlayer/rejected');
      expect(result.meta.requestStatus).toBe('rejected');
      expect('error' in result && result.error.message).toContain(
        'Team with ID 999 not found',
      );
    });
  });

  describe('deletePlayerAction', () => {
    it('should remove player from state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
            players: [{ name: 'Player to Delete' }],
          },
        }),
      );

      const players = selectAllPlayers(store.getState());
      const playerID = players[0]?.id;

      expect(players).toHaveLength(1);
      expect(playerID).toBeDefined();

      await store.dispatch(deletePlayerAction(playerID!));

      const state = store.getState();
      const remainingPlayers = selectAllPlayers(state);

      expect(remainingPlayers).toHaveLength(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.delete(
          'http://localhost/api/games/:gameID/teams/:teamID/players/:playerID',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
            players: [{ name: 'Test Player' }],
          },
        }),
      );

      const players = selectAllPlayers(store.getState());
      const playerID = players[0]?.id;

      await store.dispatch(deletePlayerAction(playerID!));

      const state = store.getState();
      expect(state.players.status).toBe('failed');
    });

    it('should handle player not found error', async () => {
      const store = createTestStore();

      const result = await store.dispatch(deletePlayerAction(999));

      expect(result.type).toBe('players/deletePlayer/rejected');
      expect(result.meta.requestStatus).toBe('rejected');
      expect('error' in result && result.error.message).toContain(
        'Player with ID 999 not found',
      );
    });
  });

  describe('cross-slice integration', () => {
    it('should add players when team is created', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
            players: [{ name: 'Player 1' }, { name: 'Player 2' }],
          },
        }),
      );

      const state = store.getState();
      const players = selectAllPlayers(state);

      expect(players).toHaveLength(2);
      expect(players[0]?.name).toBe('Player 1');
      expect(players[1]?.name).toBe('Player 2');
      expect(state.players.status).toBe('succeeded');
    });
  });
});
