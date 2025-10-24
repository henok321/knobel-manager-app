import { setupServer } from 'msw/node';

import {
  gamesHandlers,
  teamsHandlers,
  playersHandlers,
  tablesHandlers,
} from '../handlers';

export const server = setupServer(
  ...gamesHandlers,
  ...teamsHandlers,
  ...playersHandlers,
  ...tablesHandlers,
);
