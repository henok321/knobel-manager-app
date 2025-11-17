import { FirebaseError } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth as firebaseAuth } from './firebaseConfig.ts';
import { api } from '../api/rtkQueryApi.ts';
import store from '../store/store.ts';

type LoginData = {
  email: string;
  password: string;
};

type AuthError = {
  code: 'UNKNOWN_ERROR' | 'INVALID_CREDENTIALS';
};

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginAction: (loginData: LoginData) => Promise<AuthError | null>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  loginAction: async () => null,
  logOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }),
    [],
  );

  const loginAction = useCallback(
    async ({ email, password }: LoginData): Promise<AuthError | null> => {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } catch (error: unknown) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code == 'auth/invalid-credential') {
          return { code: 'INVALID_CREDENTIALS' };
        }
        return { code: 'UNKNOWN_ERROR' };
      }
      return null;
    },
    [],
  );

  const logOut = useCallback(() => {
    // Remove active_game_id from localStorage (from Context)
    localStorage.removeItem('active_game_id');
    // Reset RTK Query cache
    store.dispatch(api.util.resetApiState());
    void signOut(firebaseAuth);
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginAction,
      logOut,
    }),
    [user, loading, loginAction, logOut],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, type LoginData };
