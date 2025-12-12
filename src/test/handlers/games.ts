import { http, HttpResponse } from 'msw';

import { GameResponse, GamesResponse } from '../../generated';

const BASE_URL = 'http://localhost/api';

export const gamesHandlers = [
  http.get(`${BASE_URL}/games`, () => {
    const response: GamesResponse = {
      games: [
        {
          id: 1,
          name: 'Test Game 1',
          teamSize: 3,
          tableSize: 4,
          numberOfRounds: 2,
          status: 'in_progress',
          owners: [{ gameID: 1, ownerSub: 'test-user-123' }],
          teams: [
            {
              id: 1,
              name: 'Team A',
              gameID: 1,
              players: [
                { id: 1, name: 'Player 1', teamID: 1 },
                { id: 2, name: 'Player 2', teamID: 1 },
              ],
            },
            {
              id: 2,
              name: 'Team B',
              gameID: 1,
              players: [{ id: 3, name: 'Player 3', teamID: 2 }],
            },
          ],
          rounds: [
            {
              id: 1,
              roundNumber: 1,
              tables: [
                {
                  id: 1,
                  tableNumber: 1,
                  roundID: 1,
                  players: [
                    { id: 1, name: 'Player 1', teamID: 1 },
                    { id: 3, name: 'Player 3', teamID: 2 },
                  ],
                  scores: [
                    { id: 1, playerID: 1, tableID: 1, score: 10 },
                    { id: 2, playerID: 3, tableID: 1, score: 20 },
                  ],
                },
              ],
              gameID: 1,
              status: 'in_progress',
            },
          ],
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  http.post(`${BASE_URL}/games`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      teamSize: number;
      tableSize: number;
      numberOfRounds: number;
    };

    const response: GameResponse = {
      game: {
        id: 1,
        name: body.name,
        teamSize: body.teamSize,
        tableSize: body.tableSize,
        numberOfRounds: body.numberOfRounds,
        status: 'setup',
        owners: [
          {
            gameID: 1,
            ownerSub: 'test-user-123',
          },
        ],
        teams: [],
        rounds: [],
      },
    };

    return HttpResponse.json(response);
  }),

  http.put(`${BASE_URL}/games/:id`, async ({ params, request }) => {
    const gameID = Number(params.id);
    const body = (await request.json()) as {
      name?: string;
      teamSize?: number;
      tableSize?: number;
      numberOfRounds?: number;
    };

    const response: GameResponse = {
      game: {
        id: gameID,
        name: body.name || 'Updated Game',
        teamSize: body.teamSize || 3,
        tableSize: body.tableSize || 4,
        numberOfRounds: body.numberOfRounds || 5,
        status: 'setup',
        owners: [
          {
            gameID,
            ownerSub: 'test-user-123',
          },
        ],
        teams: [],
        rounds: [],
      },
    };

    return HttpResponse.json(response);
  }),

  http.delete(
    `${BASE_URL}/games/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.post(
    `${BASE_URL}/games/:id/setup`,
    () => new HttpResponse(null, { status: 200 }),
  ),

  http.get(`${BASE_URL}/games/:id`, ({ params }) => {
    const gameID = Number(params.id);

    const game: GameResponse['game'] = {
      id: gameID,
      name: 'Game to Setup',
      teamSize: 3,
      tableSize: 4,
      numberOfRounds: 5,
      status: 'in_progress',
      owners: [
        {
          gameID,
          ownerSub: 'test-user-123',
        },
      ],
      teams: [],
      rounds: [
        {
          id: 1,
          roundNumber: 1,
          gameID,
          status: 'in_progress',
          tables: [],
        },
      ],
    };

    // getGame returns Game directly (not wrapped in GameResponse)
    return HttpResponse.json(game);
  }),
];
