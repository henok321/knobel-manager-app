import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ActiveGameProvider } from './contexts/ActiveGameContext.tsx';
import CenterLoader from './shared/CenterLoader.tsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const Login = lazy(() => import('./pages/Login.tsx'));
const Home = lazy(() => import('./pages/home/Home.tsx'));
const Games = lazy(() => import('./pages/games/Games.tsx'));
const GameDetail = lazy(() => import('./pages/games/GameDetail.tsx'));
const PrintView = lazy(() => import('./pages/games/PrintView.tsx'));

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <ActiveGameProvider>
        <MantineProvider>
          <ModalsProvider>
            <Notifications position="top-right" />
            <BrowserRouter>
              <Suspense fallback={<CenterLoader />}>
                <Routes>
                  <Route element={<Login />} path="/login" />
                  <Route element={<ProtectedRoute />}>
                    <Route element={<Home />} path="/" />
                    <Route element={<Games />} path="/games" />
                    <Route element={<GameDetail />} path="/games/:gameId" />
                    <Route
                      element={<PrintView />}
                      path="/games/:gameId/print"
                    />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ModalsProvider>
        </MantineProvider>
      </ActiveGameProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
