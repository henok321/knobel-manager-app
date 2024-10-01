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
          LOGIN_HEADER: 'Login to your account',
          LOGIN_SUBHEADER: '',
          LOGIN_EMAIL_INPUT_LABEL: 'Email address',
          LOGIN_PASSWORD_INPUT_LABEL: 'Password',
          LOGIN_FORGOT_PASSWORD_LINK: 'Forgot password?',
          LOGIN_SIGN_IN_BUTTON: 'Login',
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
          LOGIN_HEADER: 'In deinem Konto anmelden',
          LOGIN_SUBHEADER: '',
          LOGIN_EMAIL_INPUT_LABEL: 'E-Mail-Addresse',
          LOGIN_PASSWORD_INPUT_LABEL: 'Passwort',
          LOGIN_FORGOT_PASSWORD_LINK: 'Passwort vergessen?',
          LOGIN_SIGN_IN_BUTTON: 'Anmelden',
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
