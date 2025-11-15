import { http, HttpResponse } from 'msw';

import { TeamResponse } from '../../api/types';

const BASE_URL = 'http://localhost/api';

export const teamsHandlers = [
  http.post(`${BASE_URL}/games/:gameID/teams`, async ({ params, request }) => {
    const gameID = Number(params.gameID);
    const body = (await request.json()) as {
      name: string;
      players?: Array<{ name: string }>;
    };

    const response: TeamResponse = {
      team: {
        id: 1,
        name: body.name,
        gameID,
        players: body.players?.map((player, index) => ({
          id: index + 1,
          name: player.name,
          teamID: 1,
        })),
      },
    };

    return HttpResponse.json(response);
  }),

  http.put(
    `${BASE_URL}/games/:gameID/teams/:teamID`,
    async ({ params, request }) => {
      const gameID = Number(params.gameID);
      const teamID = Number(params.teamID);
      const body = (await request.json()) as { name: string };

      const response: TeamResponse = {
        team: {
          id: teamID,
          name: body.name,
          gameID,
          players: [],
        },
      };

      return HttpResponse.json(response);
    },
  ),

  http.delete(
    `${BASE_URL}/games/:gameID/teams/:teamID`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
