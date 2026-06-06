import type {
  Player,
  Score,
  Table,
  Team,
} from '../../../../store/generatedApi.ts';
import {
  aggregateScoresFromTables,
  mapPlayersToRankings,
  mapTeamsToRankings,
} from './rankingsMapper.ts';

const player = (id: number, teamID: number, name: string): Player => ({
  id,
  name,
  teamID,
});

const score = (id: number, playerID: number, value: number): Score => ({
  id,
  playerID,
  tableID: 0,
  score: value,
});

const table = (id: number, roundID: number, scores: Score[]): Table => ({
  id,
  tableNumber: id,
  roundID,
  scores,
});

const team = (id: number, name: string, players: Player[]): Team => ({
  id,
  name,
  gameID: 1,
  players,
});

describe('aggregateScoresFromTables', () => {
  type Case = {
    name: string;
    tables: Table[];
    expected: Record<number, number>;
  };

  const cases: Case[] = [
    {
      name: 'empty tables produce no scores',
      tables: [],
      expected: {},
    },
    {
      name: 'single table sums per player',
      tables: [table(1, 10, [score(1, 100, 5), score(2, 200, 3)])],
      expected: { 100: 5, 200: 3 },
    },
    {
      name: 'aggregates the same player across multiple tables and rounds',
      tables: [
        table(1, 10, [score(1, 100, 5), score(2, 200, 3)]),
        table(2, 20, [score(3, 100, 7), score(4, 200, 1)]),
      ],
      expected: { 100: 12, 200: 4 },
    },
    {
      name: 'treats missing/zero score values as zero',
      tables: [
        table(1, 10, [
          { id: 1, playerID: 100, tableID: 0, score: 0 },
          score(2, 200, 4),
        ]),
      ],
      expected: { 100: 0, 200: 4 },
    },
    {
      name: 'ignores tables without a scores array',
      tables: [
        { id: 1, tableNumber: 1, roundID: 10 },
        table(2, 10, [score(1, 100, 9)]),
      ],
      expected: { 100: 9 },
    },
  ];

  it.each(cases)('$name', ({ tables, expected }) => {
    expect(aggregateScoresFromTables(tables)).toEqual(expected);
  });
});

describe('mapPlayersToRankings', () => {
  const teamA = team(1, 'Alpha', [
    player(100, 1, 'Ann'),
    player(101, 1, 'Bob'),
  ]);
  const teamB = team(2, 'Beta', [player(200, 2, 'Cara')]);

  it('builds one ranking per team player with scores resolved (default 0) and sorted descending', () => {
    const result = mapPlayersToRankings([teamA, teamB], [], {
      100: 8,
      200: 12,
    });

    expect(result).toEqual([
      {
        playerID: 200,
        playerName: 'Cara',
        teamID: 2,
        teamName: 'Beta',
        totalScore: 12,
      },
      {
        playerID: 100,
        playerName: 'Ann',
        teamID: 1,
        teamName: 'Alpha',
        totalScore: 8,
      },
      {
        playerID: 101,
        playerName: 'Bob',
        teamID: 1,
        teamName: 'Alpha',
        totalScore: 0,
      },
    ]);
  });

  it('returns an empty list when there are no teams', () => {
    expect(mapPlayersToRankings([], [], {})).toEqual([]);
  });

  it('skips teams with no players', () => {
    const emptyTeam = team(3, 'Empty', []);
    expect(mapPlayersToRankings([emptyTeam], [], {})).toEqual([]);
  });

  it('prefers the canonical player from the players list over the embedded team player', () => {
    const embedded = player(100, 1, 'Stale Name');
    const canonical = player(100, 1, 'Fresh Name');
    const teamWithStale = team(1, 'Alpha', [embedded]);

    const result = mapPlayersToRankings([teamWithStale], [canonical], {
      100: 5,
    });

    expect(result).toEqual([
      {
        playerID: 100,
        playerName: 'Fresh Name',
        teamID: 1,
        teamName: 'Alpha',
        totalScore: 5,
      },
    ]);
  });
});

describe('mapTeamsToRankings', () => {
  const teamA = team(1, 'Alpha', [
    player(100, 1, 'Ann'),
    player(101, 1, 'Bob'),
  ]);
  const teamB = team(2, 'Beta', [player(200, 2, 'Cara')]);
  const teamC = team(3, 'Gamma', [player(300, 3, 'Dan')]);

  it('sums player scores per team and sorts descending', () => {
    expect(
      mapTeamsToRankings([teamA, teamB], { 100: 4, 101: 3, 200: 10 }),
    ).toEqual([
      { teamID: 2, teamName: 'Beta', totalScore: 10 },
      { teamID: 1, teamName: 'Alpha', totalScore: 7 },
    ]);
  });

  it('includes teams with zero score (no scored players)', () => {
    expect(mapTeamsToRankings([teamA, teamC], { 100: 5, 101: 2 })).toEqual([
      { teamID: 1, teamName: 'Alpha', totalScore: 7 },
      { teamID: 3, teamName: 'Gamma', totalScore: 0 },
    ]);
  });

  it('returns an empty list when there are no teams', () => {
    expect(mapTeamsToRankings([], {})).toEqual([]);
  });
});
