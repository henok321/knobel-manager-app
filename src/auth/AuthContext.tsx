import { FirebaseError } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import type React from 'react';
import { createContext, useEffect, useState } from 'react';

import { api } from '../store/api.ts';
import store from '../store/store.ts';
import { auth as firebaseAuth } from './firebaseConfig.ts';

type LoginData = {
  email: string;
  password: string;
};

type AuthErrorCode = 'UNKNOWN_ERROR' | 'INVALID_CREDENTIALS';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginAction: (loginData: LoginData) => Promise<AuthErrorCode | null>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  loginAction: () => Promise.resolve(null),
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

  const loginAction = async ({
    email,
    password,
  }: LoginData): Promise<AuthErrorCode | null> => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: unknown) {
      if (
        error instanceof FirebaseError &&
        error.code === 'auth/invalid-credential'
      ) {
        return 'INVALID_CREDENTIALS';
      }
      return 'UNKNOWN_ERROR';
    }
    return null;
  };

  const logOut = async () => {
    await signOut(firebaseAuth);
    localStorage.clear();
    store.dispatch(api.util.resetApiState());
  };

  const contextValue: AuthContextValue = {
    user,
    loading,
    loginAction,
    logOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, type LoginData };
