import { HttpResponse, http } from 'msw';

import type { TableResponse, TablesResponse } from '../../generated';

const BASE_URL = 'http://localhost/api';

export const tablesHandlers = [
  http.get(
    `${BASE_URL}/games/:gameID/rounds/:roundNumber/tables`,
    ({ params }) => {
      const roundNumber = Number(params.roundNumber);

      const response: TablesResponse = {
        tables: [
          {
            id: roundNumber * 10 + 1,
            tableNumber: 1,
            roundID: roundNumber,
            players: [],
            scores: [],
          },
          {
            id: roundNumber * 10 + 2,
            tableNumber: 2,
            roundID: roundNumber,
            players: [],
            scores: [],
          },
        ],
      };

      return HttpResponse.json(response);
    },
  ),

  http.put(
    `${BASE_URL}/games/:gameID/rounds/:roundNumber/tables/:tableNumber/scores`,
    async ({ params, request }) => {
      const roundNumber = Number(params.roundNumber);
      const tableNumber = Number(params.tableNumber);
      const tableID = roundNumber * 10 + tableNumber;
      const body = (await request.json()) as {
        scores: { playerID: number; score: number }[];
      };

      const response: TableResponse = {
        table: {
          id: tableID,
          tableNumber,
          roundID: roundNumber,
          players: [],
          scores: body.scores.map((s, index) => ({
            id: index + 1,
            playerID: s.playerID,
            tableID,
            score: s.score,
          })),
        },
      };

      return HttpResponse.json(response);
    },
  ),
];
