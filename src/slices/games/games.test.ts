/**
 * @jest-environment node
 */

import { http, HttpResponse } from 'msw';

import {
  createGameAction,
  createTeamAction,
  deleteGameAction,
  deletePlayerAction,
  deleteTeamAction,
  fetchAll,
  fetchAllTablesForGame,
  fetchTablesForRound,
  setupGameAction,
  updateGameAction,
  updatePlayerAction,
  updateScoresForTable,
  updateTeamAction,
} from './slice';
import { selectAllGames, selectGamesError, selectGamesStatus } from './slice';
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

  describe('fetchAll', () => {
    it('should fetch games with denormalized nested structure', async () => {
      const store = createTestStore();

      // Fetch all games (will get the default MSW mock data)
      await store.dispatch(fetchAll());

      const state = store.getState();
      const fetchedGames = selectAllGames(state);

      // MSW returns 2 games with nested teams and players
      expect(fetchedGames.length).toBeGreaterThanOrEqual(1);
      expect(fetchedGames[0]?.teams).toBeDefined();
      expect(fetchedGames[0]?.teams?.[0]?.name).toBeDefined();
      expect(fetchedGames[0]?.teams?.[0]?.players).toBeDefined();
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(
          'http://localhost/api/games',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(fetchAll());

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('createTeamAction', () => {
    it('should add team to game.teams array', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(games[0]?.teams).toEqual([]);

      await store.dispatch(
        createTeamAction({
          gameID: gameID!,
          teamRequest: { name: 'Team Alpha' },
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);

      expect(updatedGames[0]?.teams).toHaveLength(1);
      expect(updatedGames[0]?.teams?.[0]?.name).toBe('Team Alpha');
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.post(
          'http://localhost/api/games/:id/teams',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        createTeamAction({
          gameID: 1,
          teamRequest: { name: 'Team Alpha' },
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('updateTeamAction', () => {
    it('should update team in game.teams array', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      await store.dispatch(
        createTeamAction({
          gameID: gameID!,
          teamRequest: { name: 'Original Team' },
        }),
      );

      const gamesWithTeam = selectAllGames(store.getState());
      const teamID = gamesWithTeam[0]?.teams?.[0]?.id;

      expect(teamID).toBeDefined();

      await store.dispatch(
        updateTeamAction({
          gameID: gameID!,
          teamID: teamID!,
          teamRequest: { name: 'Updated Team' },
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);

      expect(updatedGames[0]?.teams?.[0]?.name).toBe('Updated Team');
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:gameId/teams/:teamId',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        updateTeamAction({
          gameID: 1,
          teamID: 1,
          teamRequest: { name: 'Updated Team' },
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('deleteTeamAction', () => {
    it('should remove team from game.teams array', async () => {
      const store = createTestStore();

      await store.dispatch(
        createGameAction({
          name: 'Test Game',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 5,
        }),
      );

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      await store.dispatch(
        createTeamAction({
          gameID: gameID!,
          teamRequest: { name: 'Team to Delete' },
        }),
      );

      const gamesWithTeam = selectAllGames(store.getState());
      const teamID = gamesWithTeam[0]?.teams?.[0]?.id;

      expect(gamesWithTeam[0]?.teams).toHaveLength(1);

      await store.dispatch(
        deleteTeamAction({
          gameID: gameID!,
          teamID: teamID!,
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);

      expect(updatedGames[0]?.teams).toHaveLength(0);
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.delete(
          'http://localhost/api/games/:gameId/teams/:teamId',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        deleteTeamAction({
          gameID: 1,
          teamID: 1,
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('updatePlayerAction', () => {
    it('should update player in team.players array', async () => {
      const store = createTestStore();

      // Fetch games with existing teams and players from MSW
      await store.dispatch(fetchAll());

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;
      const teamID = games[0]?.teams?.[0]?.id;
      const playerID = games[0]?.teams?.[0]?.players?.[0]?.id;

      expect(gameID).toBeDefined();
      expect(teamID).toBeDefined();
      expect(playerID).toBeDefined();

      await store.dispatch(
        updatePlayerAction({
          gameID: gameID!,
          teamID: teamID!,
          playerID: playerID!,
          playerRequest: { name: 'Updated Player' },
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);
      const player = updatedGames[0]?.teams?.[0]?.players?.[0];

      expect(player?.name).toBe('Updated Player');
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.put(
          'http://localhost/api/games/:gameId/teams/:teamId/players/:playerId',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        updatePlayerAction({
          gameID: 1,
          teamID: 1,
          playerID: 1,
          playerRequest: { name: 'Updated Player' },
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('deletePlayerAction', () => {
    it('should remove player from team.players array', async () => {
      const store = createTestStore();

      // Fetch games with existing teams and players from MSW
      await store.dispatch(fetchAll());

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;
      const teamID = games[0]?.teams?.[0]?.id;
      const initialPlayersCount = games[0]?.teams?.[0]?.players?.length;
      const playerID = games[0]?.teams?.[0]?.players?.[0]?.id;

      expect(gameID).toBeDefined();
      expect(teamID).toBeDefined();
      expect(playerID).toBeDefined();
      expect(initialPlayersCount).toBeGreaterThan(0);

      await store.dispatch(
        deletePlayerAction({
          gameID: gameID!,
          teamID: teamID!,
          playerID: playerID!,
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);
      const remainingPlayers = updatedGames[0]?.teams?.[0]?.players;

      expect(remainingPlayers?.length).toBe(initialPlayersCount! - 1);
      expect(remainingPlayers?.find((p) => p.id === playerID)).toBeUndefined();
      expect(selectGamesStatus(state)).toBe('succeeded');
    });

    it('should handle API error', async () => {
      server.use(
        http.delete(
          'http://localhost/api/games/:gameId/teams/:teamId/players/:playerId',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(
        deletePlayerAction({
          gameID: 1,
          teamID: 1,
          playerID: 1,
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('fetchTablesForRound', () => {
    it('should fetch tables for specific round and update state', async () => {
      const store = createTestStore();

      // First fetch all games to get a game with rounds
      await store.dispatch(fetchAll());
      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();

      // Fetch tables for round 1
      await store.dispatch(
        fetchTablesForRound({ gameID: gameID!, roundNumber: 1 }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);
      const round = updatedGames[0]?.rounds?.find((r) => r.roundNumber === 1);

      expect(round).toBeDefined();
      expect(round?.tables).toBeDefined();
      expect(Array.isArray(round?.tables)).toBe(true);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(
          'http://localhost/api/games/:gameId/rounds/:roundNumber/tables',
          () => new HttpResponse(null, { status: 500 }),
        ),
      );

      const store = createTestStore();

      await store.dispatch(fetchTablesForRound({ gameID: 1, roundNumber: 1 }));

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('fetchAllTablesForGame', () => {
    it('should fetch tables for all rounds', async () => {
      const store = createTestStore();

      // Fetch existing games that have rounds set up
      await store.dispatch(fetchAll());

      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;
      const numberOfRounds = games[0]?.numberOfRounds;

      expect(gameID).toBeDefined();
      expect(numberOfRounds).toBeDefined();

      // Fetch tables for all rounds
      await store.dispatch(
        fetchAllTablesForGame({
          gameID: gameID!,
          numberOfRounds: numberOfRounds!,
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);
      const game = updatedGames[0];

      expect(game).toBeDefined();
      expect(selectGamesStatus(state)).toBe('succeeded');
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
        fetchAllTablesForGame({ gameID: 1, numberOfRounds: 3 }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });

  describe('updateScoresForTable', () => {
    it('should update scores for a table in a round', async () => {
      const store = createTestStore();

      // Fetch games with existing data
      await store.dispatch(fetchAll());
      const games = selectAllGames(store.getState());
      const gameID = games[0]?.id;

      expect(gameID).toBeDefined();

      // Fetch tables for round 1
      await store.dispatch(
        fetchTablesForRound({ gameID: gameID!, roundNumber: 1 }),
      );

      // Update scores for table 1
      const scores = [
        { playerID: 1, score: 10 },
        { playerID: 2, score: 20 },
      ];

      await store.dispatch(
        updateScoresForTable({
          gameID: gameID!,
          roundNumber: 1,
          tableNumber: 1,
          scores,
        }),
      );

      const state = store.getState();
      const updatedGames = selectAllGames(state);
      const round = updatedGames[0]?.rounds?.find((r) => r.roundNumber === 1);

      expect(round?.tables).toBeDefined();
      expect(selectGamesStatus(state)).toBe('succeeded');
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
          gameID: 1,
          roundNumber: 1,
          tableNumber: 1,
          scores: [{ playerID: 1, score: 10 }],
        }),
      );

      const state = store.getState();
      expect(selectGamesStatus(state)).toBe('failed');
      expect(selectGamesError(state)).toBeDefined();
    });
  });
});
