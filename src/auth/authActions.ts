import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { AppDispatch } from '../store/store.ts';
import { loginFailure, loginSuccess, logout } from './authReducer.ts';

export const loginAction =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      if (!user || !user.email || !user.uid) {
        dispatch(loginFailure('Invalid user'));
      } else {
        const idToken = await user.getIdToken();

        const userInfo = {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || '',
        };
        dispatch(loginSuccess(userInfo));
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...userInfo,
            idToken,
            refreshToken: user.refreshToken,
          }),
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }
  };

export const logoutAction = () => async (dispatch: AppDispatch) => {
  localStorage.removeItem('user');
  dispatch(logout());
};
