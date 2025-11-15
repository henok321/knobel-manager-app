import {
  selectAllGamesNormalized,
  selectGameByIdNormalized,
  selectAllTeamsNormalized,
  selectAllPlayersNormalized,
} from './normalizedSelectors';
import type { Game as ApiGame } from '../generated/api';

type QueryState = {
  status: 'fulfilled' | 'pending' | 'rejected';
  endpointName: string;
  requestId: string;
  startedTimeStamp: number;
  fulfilledTimeStamp?: number;
  data?: { games: ApiGame[] };
  isUninitialized: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

type RootState = {
  api: {
    queries: {
      ['getGames(undefined)']?: QueryState;
    };
  };
};

const FIXED_TIMESTAMP = 1700000000000;

const createMockState = (gamesData: ApiGame[] | undefined): RootState => {
  if (gamesData === undefined) {
    return {
      api: {
        queries: {},
      },
    };
  }

  return {
    api: {
      queries: {
        ['getGames(undefined)']: {
          status: 'fulfilled',
          endpointName: 'getGames',
          requestId: 'test-request-id',
          startedTimeStamp: FIXED_TIMESTAMP,
          fulfilledTimeStamp: FIXED_TIMESTAMP,
          data: { games: gamesData },
          isUninitialized: false,
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      },
    },
  };
};

// Suppress reselect development warnings in tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const message = String(args[0]);
    if (
      message.includes('An input selector returned a different result') ||
      message.includes('reselect')
    ) {
      return;
    }
    // Allow other warnings through
    jest.requireActual('console').warn(...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('normalizedSelectors', () => {
  describe('selectNormalizedGamesData', () => {
    it('normalizes complete nested game data', () => {
      const mockGame: ApiGame = {
        id: 1,
        name: 'Test Game',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'in_progress',
        owners: [{ gameID: 1, ownerSub: 'owner-1' }],
        teams: [
          {
            id: 10,
            name: 'Team A',
            gameID: 1,
            players: [
              { id: 100, name: 'Player 1', teamID: 10 },
              { id: 101, name: 'Player 2', teamID: 10 },
            ],
          },
          {
            id: 11,
            name: 'Team B',
            gameID: 1,
            players: [
              { id: 102, name: 'Player 3', teamID: 11 },
              { id: 103, name: 'Player 4', teamID: 11 },
            ],
          },
        ],
        rounds: [
          {
            id: 20,
            gameID: 1,
            roundNumber: 1,
            status: 'completed',
          },
        ],
      };

      const state = createMockState([mockGame]);

      const games = selectAllGamesNormalized(state);
      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(games).toHaveLength(1);
      expect(games[0]).toEqual({
        id: 1,
        name: 'Test Game',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'in_progress',
        teams: [10, 11],
        rounds: [20],
        owners: ['owner-1'],
      });

      expect(teams).toHaveLength(2);
      expect(teams).toContainEqual({
        id: 10,
        name: 'Team A',
        gameID: 1,
        players: [100, 101],
      });
      expect(teams).toContainEqual({
        id: 11,
        name: 'Team B',
        gameID: 1,
        players: [102, 103],
      });

      expect(players).toHaveLength(4);
      expect(players).toContainEqual({ id: 100, name: 'Player 1', teamID: 10 });
      expect(players).toContainEqual({ id: 101, name: 'Player 2', teamID: 10 });
      expect(players).toContainEqual({ id: 102, name: 'Player 3', teamID: 11 });
      expect(players).toContainEqual({ id: 103, name: 'Player 4', teamID: 11 });
    });

    it('handles missing optional fields (teams, rounds)', () => {
      const mockGame: ApiGame = {
        id: 1,
        name: 'Minimal Game',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'setup',
        owners: [],
      };

      const state = createMockState([mockGame]);

      const games = selectAllGamesNormalized(state);
      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(games).toHaveLength(1);
      expect(games[0]).toEqual({
        id: 1,
        name: 'Minimal Game',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'setup',
        teams: [],
        rounds: [],
        owners: [],
      });

      expect(teams).toHaveLength(0);
      expect(players).toHaveLength(0);
    });

    it('handles teams without players', () => {
      const mockGame: ApiGame = {
        id: 1,
        name: 'Game with Empty Teams',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'setup',
        owners: [],
        teams: [
          { id: 10, name: 'Team A', gameID: 1 },
          { id: 11, name: 'Team B', gameID: 1, players: [] },
        ],
      };

      const state = createMockState([mockGame]);

      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(teams).toHaveLength(2);
      expect(teams[0]).toEqual({
        id: 10,
        name: 'Team A',
        gameID: 1,
        players: [],
      });
      expect(teams[1]).toEqual({
        id: 11,
        name: 'Team B',
        gameID: 1,
        players: [],
      });

      expect(players).toHaveLength(0);
    });

    it('returns empty dictionaries when data is undefined', () => {
      const state = createMockState(undefined);

      const games = selectAllGamesNormalized(state);
      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(games).toEqual([]);
      expect(teams).toEqual([]);
      expect(players).toEqual([]);
    });

    it('handles empty games array', () => {
      const state = createMockState([]);

      const games = selectAllGamesNormalized(state);
      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(games).toEqual([]);
      expect(teams).toEqual([]);
      expect(players).toEqual([]);
    });

    it('normalizes multiple games with overlapping entity IDs correctly', () => {
      const mockGames: ApiGame[] = [
        {
          id: 1,
          name: 'Game 1',
          teamSize: 2,
          tableSize: 4,
          numberOfRounds: 3,
          status: 'setup',
          owners: [],
          teams: [
            {
              id: 10,
              name: 'Game 1 Team A',
              gameID: 1,
              players: [{ id: 100, name: 'Player 1', teamID: 10 }],
            },
          ],
        },
        {
          id: 2,
          name: 'Game 2',
          teamSize: 2,
          tableSize: 4,
          numberOfRounds: 3,
          status: 'in_progress',
          owners: [],
          teams: [
            {
              id: 20,
              name: 'Game 2 Team A',
              gameID: 2,
              players: [{ id: 200, name: 'Player 2', teamID: 20 }],
            },
          ],
        },
      ];

      const state = createMockState(mockGames);

      const games = selectAllGamesNormalized(state);
      const teams = selectAllTeamsNormalized(state);
      const players = selectAllPlayersNormalized(state);

      expect(games).toHaveLength(2);
      expect(games.map((g) => g.id)).toEqual([1, 2]);

      expect(teams).toHaveLength(2);
      expect(teams.find((t) => t.id === 10)).toEqual({
        id: 10,
        name: 'Game 1 Team A',
        gameID: 1,
        players: [100],
      });
      expect(teams.find((t) => t.id === 20)).toEqual({
        id: 20,
        name: 'Game 2 Team A',
        gameID: 2,
        players: [200],
      });

      expect(players).toHaveLength(2);
      expect(players.find((p) => p.id === 100)).toEqual({
        id: 100,
        name: 'Player 1',
        teamID: 10,
      });
      expect(players.find((p) => p.id === 200)).toEqual({
        id: 200,
        name: 'Player 2',
        teamID: 20,
      });
    });

    it('correctly maps nested objects to ID arrays', () => {
      const mockGame: ApiGame = {
        id: 1,
        name: 'Test Game',
        teamSize: 2,
        tableSize: 4,
        numberOfRounds: 3,
        status: 'in_progress',
        owners: [
          { gameID: 1, ownerSub: 'owner-1' },
          { gameID: 1, ownerSub: 'owner-2' },
        ],
        teams: [
          {
            id: 10,
            name: 'Team A',
            gameID: 1,
            players: [
              { id: 100, name: 'Player 1', teamID: 10 },
              { id: 101, name: 'Player 2', teamID: 10 },
            ],
          },
        ],
        rounds: [
          { id: 20, gameID: 1, roundNumber: 1, status: 'completed' },
          { id: 21, gameID: 1, roundNumber: 2, status: 'in_progress' },
        ],
      };

      const state = createMockState([mockGame]);

      const games = selectAllGamesNormalized(state);

      expect(games[0]?.teams).toEqual([10]);
      expect(games[0]?.rounds).toEqual([20, 21]);
      expect(games[0]?.owners).toEqual(['owner-1', 'owner-2']);

      const teams = selectAllTeamsNormalized(state);
      expect(teams[0]?.players).toEqual([100, 101]);
    });
  });

  describe('derived selectors', () => {
    const mockGame: ApiGame = {
      id: 1,
      name: 'Test Game',
      teamSize: 2,
      tableSize: 4,
      numberOfRounds: 3,
      status: 'setup',
      owners: [],
      teams: [
        {
          id: 10,
          name: 'Team A',
          gameID: 1,
          players: [{ id: 100, name: 'Player 1', teamID: 10 }],
        },
      ],
    };

    describe('selectAllGamesNormalized', () => {
      it('returns array of all games', () => {
        const state = createMockState([mockGame]);

        const games = selectAllGamesNormalized(state);

        expect(Array.isArray(games)).toBe(true);
        expect(games).toHaveLength(1);
        expect(games[0]?.id).toBe(1);
      });

      it('returns empty array when no games', () => {
        const state = createMockState([]);

        const games = selectAllGamesNormalized(state);

        expect(games).toEqual([]);
      });
    });

    describe('selectGameByIdNormalized', () => {
      it('returns specific game by ID', () => {
        const state = createMockState([mockGame]);

        const selector = selectGameByIdNormalized(1);
        const game = selector(state);

        expect(game).toBeDefined();
        expect(game?.id).toBe(1);
        expect(game?.name).toBe('Test Game');
      });

      it('returns undefined for non-existent game ID', () => {
        const state = createMockState([mockGame]);

        const selector = selectGameByIdNormalized(999);
        const game = selector(state);

        expect(game).toBeUndefined();
      });

      it('returns undefined when gameId is null', () => {
        const state = createMockState([mockGame]);

        const selector = selectGameByIdNormalized(null);
        const game = selector(state);

        expect(game).toBeUndefined();
      });

      it('handles zero as valid game ID', () => {
        const gameWithIdZero: ApiGame = {
          ...mockGame,
          id: 0,
        };
        const state = createMockState([gameWithIdZero]);

        const selector = selectGameByIdNormalized(0);
        const game = selector(state);

        expect(game).toBeDefined();
        expect(game?.id).toBe(0);
      });
    });

    describe('selectAllTeamsNormalized', () => {
      it('returns array of all teams', () => {
        const state = createMockState([mockGame]);

        const teams = selectAllTeamsNormalized(state);

        expect(Array.isArray(teams)).toBe(true);
        expect(teams).toHaveLength(1);
        expect(teams[0]?.id).toBe(10);
      });

      it('returns empty array when no teams', () => {
        const gameWithoutTeams: ApiGame = {
          ...mockGame,
          teams: undefined,
        };
        const state = createMockState([gameWithoutTeams]);

        const teams = selectAllTeamsNormalized(state);

        expect(teams).toEqual([]);
      });
    });

    describe('selectAllPlayersNormalized', () => {
      it('returns array of all players', () => {
        const state = createMockState([mockGame]);

        const players = selectAllPlayersNormalized(state);

        expect(Array.isArray(players)).toBe(true);
        expect(players).toHaveLength(1);
        expect(players[0]?.id).toBe(100);
      });

      it('returns empty array when no players', () => {
        const gameWithoutPlayers: ApiGame = {
          ...mockGame,
          teams: [{ id: 10, name: 'Team A', gameID: 1, players: [] }],
        };
        const state = createMockState([gameWithoutPlayers]);

        const players = selectAllPlayersNormalized(state);

        expect(players).toEqual([]);
      });
    });
  });
});
