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
          LOGOUT_MODAL_HEADER: 'Logout',
          LOGOUT_MODAL_HINT: 'Are you sure you want to logout?',
          LOGOUT_MODAL_CONFIRM: 'Logout',
          LOGOUT_MODAL_CANCEL: 'Cancel',
          USER_PROFILE_HEADING: 'User Profile',
          USER_PROFILE_DISPLAY_NAME: 'Display Name',
          USER_PROFILE_EMAIL: 'Email',
          USER_PROFILE_PASSWORD: 'Password',
          UPDATE_PROFILE_SUBMIT: 'Update',
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
          LOGOUT_MODAL_HEADER: 'Abmelden',
          LOGOUT_MODAL_HINT: 'Möchtest du dich wirklich abmelden?',
          LOGOUT_MODAL_CONFIRM: 'Abmelden',
          LOGOUT_MODAL_CANCEL: 'Abbrechen',
          USER_PROFILE_HEADING: 'Benutzerprofil',
          USER_PROFILE_DISPLAY_NAME: 'Anzeigename',
          USER_PROFILE_EMAIL: 'E-Mail',
          USER_PROFILE_PASSWORD: 'Passwort',
          UPDATE_PROFILE_SUBMIT: 'Aktualisieren',
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
