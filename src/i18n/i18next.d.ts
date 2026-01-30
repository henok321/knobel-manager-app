import 'i18next';

import common from './locales/en/common.json';
import games from './locales/en/games.json';
import gameDetail from './locales/en/gameDetail.json';
import pdf from './locales/en/pdf.json';
import footer from './locales/en/footer.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      common: typeof common;
      games: typeof games;
      gameDetail: typeof gameDetail;
      pdf: typeof pdf;
      footer: typeof footer;
    };
  }
}
