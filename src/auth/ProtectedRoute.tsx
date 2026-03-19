import { Navigate, Outlet } from 'react-router-dom';

import CenterLoader from '../shared/CenterLoader.tsx';
import { useAuth } from './useAuth.ts';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenterLoader />;
  }

  return user ? <Outlet /> : <Navigate replace to="/login" />;
};

export default ProtectedRoute;
