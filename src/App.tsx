import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import Login from './auth/Login.tsx';
import { SidebarProvider } from './sidebar/SidebarContext.tsx';
import { ReactNode, useEffect } from 'react';
import useAuth from './auth/authHooks.ts';

const AuthRedirect = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.user) {
      navigate('/login');
    }
  }, [authState.user, navigate]);

  return children;
};

const App = () => (
  <SidebarProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/"
          element={
            <AuthRedirect>
              <Home />
            </AuthRedirect>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthRedirect>
              <Settings />
            </AuthRedirect>
          }
        />
      </Routes>
    </BrowserRouter>
  </SidebarProvider>
);

export default App;
