import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rehydrateAuthState from './rehydrateAuthState.ts';
import useAuth from './authHooks.ts';

export const AuthRedirect = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    const hasUser = rehydrateAuthState();
    if (hasUser) {
      return;
    }
    navigate('/login');
  }, [navigate]);

  if (!authState.user) {
    return null;
  }

  return children;
};
