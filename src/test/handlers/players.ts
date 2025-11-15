import { http, HttpResponse } from 'msw';

import { PlayersResponse } from '../../api/types';

const BASE_URL = 'http://localhost/api';

export const playersHandlers = [
  http.put(
    `${BASE_URL}/games/:gameID/teams/:teamID/players/:playerID`,
    async ({ params, request }) => {
      const playerID = Number(params.playerID);
      const teamID = Number(params.teamID);
      const body = (await request.json()) as { name: string };

      const response: PlayersResponse = {
        player: {
          id: playerID,
          name: body.name,
          teamID,
        },
      };

      return HttpResponse.json(response);
    },
  ),

  http.delete(
    `${BASE_URL}/games/:gameID/teams/:teamID/players/:playerID`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
