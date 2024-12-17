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
