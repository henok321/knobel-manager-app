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
        dispatch(loginSuccess({ email: user.email, uid: user.uid }));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(loginFailure(error.message));
    }
  };

export const logoutAction = () => async (dispatch: AppDispatch) => {
  dispatch(logout());
};
