import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationsDE from './locales/de.json';
import translationsEN from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    debug: true,
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: translationsEN,
      },
      de: {
        translation: translationsDE,
      },
    },
  });

export default i18n;
