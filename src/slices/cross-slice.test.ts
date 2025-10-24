/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import { fetchAll } from './actions';
import { selectAllGames, selectActiveGame } from './games/slice';
import { selectAllPlayers } from './players/slice';
import { createTeamAction } from './teams/actions';
import { selectAllTeams } from './teams/slice';
import { server } from '../test/setup/msw';
import { createTestStore } from '../test/setup/store';

describe('Cross-Slice Integration Tests', () => {
  describe('fetchAll action', () => {
    it('should populate games slice with normalized data', async () => {
      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      const games = selectAllGames(state);

      expect(games).toHaveLength(1);
      expect(games[0]?.id).toBe(1);
      expect(games[0]?.name).toBe('Test Game 1');
      expect(games[0]?.teams).toHaveLength(2);
      expect(games[0]?.rounds).toHaveLength(1);
    });

    it('should populate teams slice from nested game data', async () => {
      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      const teams = selectAllTeams(state);

      expect(teams).toHaveLength(2);
      expect(teams[0]?.id).toBe(1);
      expect(teams[0]?.name).toBe('Team A');
      expect(teams[0]?.gameID).toBe(1);
      expect(teams[0]?.players).toHaveLength(2);
      expect(teams[1]?.id).toBe(2);
      expect(teams[1]?.name).toBe('Team B');
    });

    it('should populate players slice from nested team data', async () => {
      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      const players = selectAllPlayers(state);

      expect(players).toHaveLength(3);
      expect(players[0]?.id).toBe(1);
      expect(players[0]?.name).toBe('Player 1');
      expect(players[0]?.teamID).toBe(1);
      expect(players[1]?.id).toBe(2);
      expect(players[1]?.name).toBe('Player 2');
      expect(players[2]?.id).toBe(3);
      expect(players[2]?.name).toBe('Player 3');
      expect(players[2]?.teamID).toBe(2);
    });

    it('should set activeGameID in games slice', async () => {
      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      const activeGame = selectActiveGame(state);

      expect(activeGame).toBeDefined();
      expect(activeGame?.id).toBe(1);
      expect(activeGame?.name).toBe('Test Game 1');
    });

    it('should handle API error and set status to failed', async () => {
      server.use(
        http.get(
          'http://localhost/api/games',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      expect(state.games.status).toBe('failed');
      expect(state.teams.status).toBe('failed');
      expect(state.players.status).toBe('failed');
    });
  });

  describe('createTeamAction cross-slice effects', () => {
    it('should add players to both teams and players slices', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Cross-Slice Team',
            players: [{ name: 'Player A' }, { name: 'Player B' }],
          },
        }),
      );

      const state = store.getState();
      const teams = selectAllTeams(state);
      const players = selectAllPlayers(state);

      expect(teams).toHaveLength(1);
      expect(teams[0]?.name).toBe('Cross-Slice Team');
      expect(teams[0]?.players).toHaveLength(2);

      expect(players).toHaveLength(2);
      expect(players[0]?.name).toBe('Player A');
      expect(players[1]?.name).toBe('Player B');

      expect(state.teams.status).toBe('succeeded');
      expect(state.players.status).toBe('succeeded');
    });
  });
});
