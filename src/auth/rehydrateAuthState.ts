import { loginSuccess } from './authReducer';
import store from '../store/store.ts'; // Your auth actions

const rehydrateAuthState = () => {
  const localStorageAuthContext = localStorage.getItem('user');
  if (localStorageAuthContext) {
    const authContext = JSON.parse(localStorageAuthContext);

    const idToken = authContext.idToken;
    const refreshToken = authContext.refreshToken;

    store.dispatch(
      loginSuccess({
        email: authContext.email,
        displayName: authContext.displayName,
        uid: authContext.uid,
      }),
    );
    return true;
  }
  return false;
};

export default rehydrateAuthState;
