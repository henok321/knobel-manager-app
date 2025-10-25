import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import GameDetail from './pages/games/GameDetail.tsx';
import Games from './pages/games/Games.tsx';
import Home from './pages/home/Home.tsx';
import Login from './pages/Login.tsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <MantineProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route element={<Login />} path="/login" />
              <Route element={<ProtectedRoute />}>
                <Route element={<Home />} path="/" />
                <Route element={<Games />} path="/games" />
                <Route element={<GameDetail />} path="/games/:gameId" />
              </Route>
            </Routes>
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
