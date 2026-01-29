import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import commonDE from './locales/de/common.json';
import footerDE from './locales/de/footer.json';
import gameDetailDE from './locales/de/gameDetail.json';
import gamesDE from './locales/de/games.json';
import homeDE from './locales/de/home.json';
import pdfDE from './locales/de/pdf.json';
import commonEN from './locales/en/common.json';
import footerEN from './locales/en/footer.json';
import gameDetailEN from './locales/en/gameDetail.json';
import gamesEN from './locales/en/games.json';
import homeEN from './locales/en/home.json';
import pdfEN from './locales/en/pdf.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    defaultNS: 'common',
    fallbackNS: 'common',
    debug: !import.meta.env.PROD,
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: commonEN,
        footer: footerEN,
        home: homeEN,
        games: gamesEN,
        gameDetail: gameDetailEN,
        pdf: pdfEN,
      },
      de: {
        common: commonDE,
        footer: footerDE,
        home: homeDE,
        games: gamesDE,
        gameDetail: gameDetailDE,
        pdf: pdfDE,
      },
    },
  });

export default i18n;
