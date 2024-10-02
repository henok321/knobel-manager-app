// useAuth hook that provides auth state and methods to login and logout

import { AppDispatch } from '../store/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { UserState } from '../store/user/userSlice.ts';
import { loginWithEmail, logoutUser } from './authActions.ts';

const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: { auth: UserState }) => state.auth);

  const login = async (email: string, password: string) => {
    await dispatch(loginWithEmail(email, password));
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  return {
    userState,
    login,
    logout,
  };
};

export default useUser;
