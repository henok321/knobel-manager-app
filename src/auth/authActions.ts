import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { AppDispatch } from '../store/store.ts';
import { setUser, setUserFailed } from '../store/user/userSlice.ts';

export const loginWithEmail =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      if (!user || !user.email || !user.uid) {
        dispatch(setUserFailed('Invalid user'));
      } else {
        const userInfo = {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || '',
        };
        dispatch(setUser(userInfo));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(setUserFailed(error.message));
    }
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  await signOut(auth);
  dispatch(setUser(null));
};
