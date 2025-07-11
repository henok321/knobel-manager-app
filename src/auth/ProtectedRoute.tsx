import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth.ts';
import CenterLoader from '../components/CenterLoader.tsx';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    <CenterLoader />;
  }

  return user ? <Outlet /> : <Navigate replace to="/login" />;
};

export default ProtectedRoute;
