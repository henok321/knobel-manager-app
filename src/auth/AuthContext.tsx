import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';

import { auth as firebaseAuth } from './firebaseConfig.ts';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;

  loginAction: (loginData: LoginData) => Promise<void>;
  logOut: () => void;
}

type LoginData = {
  email: string;
  password: string;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  loginAction: async () => {},
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

  const loginAction = async ({ email, password }: LoginData) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
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

export { AuthContext, LoginData };
