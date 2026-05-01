import 'i18next';

import type common from './locales/en/common.json';
import type footer from './locales/en/footer.json';
import type gameDetail from './locales/en/gameDetail.json';
import type games from './locales/en/games.json';
import type pdf from './locales/en/pdf.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: ['common', 'footer', 'games', 'gameDetail', 'pdf'];
    resources: {
      common: typeof common;
      footer: typeof footer;
      games: typeof games;
      gameDetail: typeof gameDetail;
      pdf: typeof pdf;
    };
  }
}
