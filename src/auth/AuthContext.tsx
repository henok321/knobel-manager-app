import { FirebaseError } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';

import { auth as firebaseAuth } from './firebaseConfig.ts';

type LoginData = {
  email: string;
  password: string;
};

type AuthError = {
  code: 'UNKNWON_ERROR' | 'INVALID_CREDENDIAL';
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

  const loginAction = async ({
    email,
    password,
  }: LoginData): Promise<AuthError | null> => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code == 'auth/invalid-credential') {
        return { code: 'INVALID_CREDENDIAL' };
      }
      return { code: 'UNKNWON_ERROR' };
    }
    return null;
  };

  const logOut = () => {
    signOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAction,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, type AuthError, type LoginData };
