import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDYivrq63hr7fkTNoNiQsnzqbx3EQ6FyQI',
  authDomain: 'knobel-manager-webapp.firebaseapp.com',
  projectId: 'knobel-manager-webapp',
  storageBucket: 'knobel-manager-webapp.appspot.com',
  messagingSenderId: '655697004246',
  appId: '1:655697004246:web:f8481adef76e3ab91a6b77',
  measurementId: 'G-446E4RMJCV',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { firebaseConfig };
