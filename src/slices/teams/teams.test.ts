/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import {
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
} from './actions';
import { selectAllTeams } from './slice';
import { server } from '../../test/setup/msw';
import { createTestStore } from '../../test/setup/store';

describe('Teams Actions + Slice', () => {
  describe('createTeamAction', () => {
    it('should create team and update state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
          },
        }),
      );

      const state = store.getState();
      const teams = selectAllTeams(state);

      expect(teams).toHaveLength(1);
      expect(teams[0]?.name).toBe('Test Team');
      expect(teams[0]?.gameID).toBe(1);
      expect(state.teams.status).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.post(
          'http://localhost/api/games/:gameID/teams',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
          },
        }),
      );

      const state = store.getState();
      expect(state.teams.status).toBe('failed');
      expect(state.teams.error).toBeDefined();
    });

    it('should transition status idle → pending → succeeded', async () => {
      const store = createTestStore();
      expect(store.getState().teams.status).toBe('idle');

      const promise = store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
          },
        }),
      );

      expect(store.getState().teams.status).toBe('pending');

      await promise;

      expect(store.getState().teams.status).toBe('succeeded');
    });

    it('should create team with players', async () => {
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
      const teams = selectAllTeams(state);

      expect(teams).toHaveLength(1);
      expect(teams[0]?.players).toHaveLength(2);
      expect(teams[0]?.players[0]).toBe(1);
      expect(teams[0]?.players[1]).toBe(2);
    });
  });

  describe('updateTeamAction', () => {
    it('should update team in state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Original Team',
          },
        }),
      );

      const teams = selectAllTeams(store.getState());
      const teamID = teams[0]?.id;

      expect(teamID).toBeDefined();

      await store.dispatch(
        updateTeamAction({
          teamID: teamID!,
          name: 'Updated Team',
        }),
      );

      const state = store.getState();
      const updatedTeams = selectAllTeams(state);

      expect(updatedTeams).toHaveLength(1);
      expect(updatedTeams[0]?.name).toBe('Updated Team');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:gameID/teams/:teamID',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
          },
        }),
      );

      const teams = selectAllTeams(store.getState());
      const teamID = teams[0]?.id;

      await store.dispatch(
        updateTeamAction({
          teamID: teamID!,
          name: 'Updated Team',
        }),
      );

      const state = store.getState();
      expect(state.teams.status).toBe('failed');
    });

    it('should handle team not found error', async () => {
      const store = createTestStore();

      const result = await store.dispatch(
        updateTeamAction({
          teamID: 999,
          name: 'Updated Team',
        }),
      );

      expect(result.type).toBe('teams/updateTeam/rejected');
      expect(result.meta.requestStatus).toBe('rejected');
      expect('error' in result && result.error.message).toContain(
        'Team with ID 999 not found',
      );
    });
  });

  describe('deleteTeamAction', () => {
    it('should remove team from state', async () => {
      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Team to Delete',
          },
        }),
      );

      const teams = selectAllTeams(store.getState());
      const teamID = teams[0]?.id;

      expect(teams).toHaveLength(1);
      expect(teamID).toBeDefined();

      await store.dispatch(deleteTeamAction(teamID!));

      const state = store.getState();
      const remainingTeams = selectAllTeams(state);

      expect(remainingTeams).toHaveLength(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.delete(
          'http://localhost/api/games/:gameID/teams/:teamID',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: {
            name: 'Test Team',
          },
        }),
      );

      const teams = selectAllTeams(store.getState());
      const teamID = teams[0]?.id;

      await store.dispatch(deleteTeamAction(teamID!));

      const state = store.getState();
      expect(state.teams.status).toBe('failed');
    });
  });
});
