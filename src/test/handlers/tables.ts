import { http, HttpResponse } from 'msw';

import { TablesResponse } from '../../generated';

const BASE_URL = 'http://localhost/api';

export const tablesHandlers = [
  http.get(
    `${BASE_URL}/games/:gameId/rounds/:roundNumber/tables`,
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
    `${BASE_URL}/games/:gameId/rounds/:roundNumber/tables/:tableNumber/scores`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
