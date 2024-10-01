import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBeIhB8cb_U3We-rx1UJTb9p4RGpOVsJSg',
  authDomain: 'knobel-manager.firebaseapp.com',
  projectId: 'knobel-manager',
  storageBucket: 'knobel-manager.appspot.com',
  messagingSenderId: '566295896360',
  appId: '1:566295896360:web:93de8e1c3e49371f04701d',
  measurementId: 'G-H1EKVHT2MC',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
