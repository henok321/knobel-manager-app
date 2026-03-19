import { setupServer } from 'msw/node';

import {
  gamesHandlers,
  playersHandlers,
  tablesHandlers,
  teamsHandlers,
} from '../handlers';

export const server = setupServer(
  ...gamesHandlers,
  ...teamsHandlers,
  ...playersHandlers,
  ...tablesHandlers,
);
