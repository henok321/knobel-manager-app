import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          SIDEBAR_TITLE: 'Knobel Manager',
          SIDEBAR_ITEM_HOME: 'Home',
          SIDEBAR_ITEM_SETTINGS: 'Settings',
          SIDEBAR_HEADER_MENU_ITEM_PROFILE: 'Profile',
          SIDEBAR_HEADER_MENU_ITEM_SETTINGS: 'Settings',
          SIDEBAR_HEADER_MENU_ITEM_LOGOUT: 'Logout',
        },
      },
      de: {
        translation: {
          SIDEBAR_TITLE: 'Knobel Manager',
          SIDEBAR_ITEM_HOME: 'Startseite',
          SIDEBAR_ITEM_SETTINGS: 'Einstellungen',
          SIDEBAR_HEADER_MENU_ITEM_PROFILE: 'Profil',
          SIDEBAR_HEADER_MENU_ITEM_SETTINGS: 'Einstellungen',
          SIDEBAR_HEADER_MENU_ITEM_LOGOUT: 'Abmelden',
        },
      },
    },
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
