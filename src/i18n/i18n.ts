import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          global: {
            loading: 'Loading...',
          },
          header: {
            heading: 'Knobel Manager',
            logout: 'Logout',
            nav: {
              home: 'Home',
              games: 'Games',
            },
          },

          pages: {
            login: {
              heading: 'Login to your account',
              label: {
                email: 'Email',
                password: 'Password',
              },
              submit: 'Login',
            },
            home: {
              heading: 'Home',
            },
            games: {
              heading: 'Games',
              createGameButton: 'Create game',
              card: {
                details: {
                  teamSize: 'Team size:',
                  tableSize: 'Table size:',
                  numberOfRounds: 'Number of Rounds:',
                  status: 'Status:',
                },
                activateButton: 'Activate',
                deleteButton: 'Delete',
              },
              form: {
                heading: 'Create game',
                label: {
                  name: 'Name',
                  teamSize: 'Team size',
                  tableSize: 'Table size',
                  rounds: 'Number of rounds',
                },
                submit: 'Create',
              },
            },
          },
        },
      },
    },
  });

export default i18n;
