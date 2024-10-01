// useAuth hook that provides auth state and methods to login and logout

import { AppDispatch } from '../store/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { AuthState } from './authReducer.ts';
import { loginAction, logoutAction } from './authActions.ts';

const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: { auth: AuthState }) => state.auth);

  const login = async (email: string, password: string) => {
    await dispatch(loginAction(email, password));
  };

  const logout = async () => {
    await dispatch(logoutAction());
  };

  return {
    authState,
    login,
    logout,
  };
};

export default useAuth;
