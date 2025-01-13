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
          LOGIN_HEADING: 'Login to your account',
          LOGIN_EMAIL_INPUT_LABEL: 'Email address',
          LOGIN_PASSWORD_INPUT_LABEL: 'Password',
          LOGIN_BUTTON: 'Login',
          LOGOUT_BUTTON: 'Logout',
          HEADER_TITLE: 'Knobel Manager',
          NAV_HOME: 'Home',
          NAV_GAMES: 'Games',
          GAMES_PAGE_HEADLINE: 'Games',
          GAMES_PAGE_SHOW_DETAILS_BUTTON: 'Show details',
          GAMES_PAGE_HIDE_DETAILS_BUTTON: 'Hide details',
          HOME_PAGE_HEADLINE: 'Home‚',
        },
      },
      de: {
        translation: {
          LOGIN_HEADING: 'Log dich ein',
          LOGIN_EMAIL_INPUT_LABEL: 'E-Mail',
          LOGIN_PASSWORD_INPUT_LABEL: 'Passwort',
          LOGIN_BUTTON: 'Anmelden',
          LOGOUT_BUTTON: 'Abmelden',
          HEADER_TITLE: 'Knobel Manager',
          NAV_HOME: 'Startseite',
          NAV_GAMES: 'Spiele',
          GAMES_PAGE_HEADLINE: 'Spiele',
          GAMES_PAGE_SHOW_DETAILS_BUTTON: 'Details anzeigen',
          GAMES_PAGE_HIDE_DETAILS_BUTTON: 'Details ausblenden',
          HOME_PAGE_HEADLINE: 'Startseite‚',
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
