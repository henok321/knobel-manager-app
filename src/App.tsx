import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { lazy, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import i18n from './i18n/i18nConfig.ts';
import CenterLoader from './shared/CenterLoader.tsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ErrorBoundary } from './shared/ErrorBoundary.tsx';
import store from './store/store.ts';

const Login = lazy(() => import('./pages/Login.tsx'));
const Games = lazy(() => import('./pages/games/Games.tsx'));
const GameDetail = lazy(() => import('./pages/games/GameDetail.tsx'));
const PrintView = lazy(() => import('./pages/games/PrintView.tsx'));

const App = () => (
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <AuthProvider>
          <MantineProvider defaultColorScheme="auto">
            <ModalsProvider>
              <Notifications position="top-right" />
              <BrowserRouter>
                <Suspense fallback={<CenterLoader />}>
                  <Routes>
                    <Route element={<Login />} path="/login" />
                    <Route element={<ProtectedRoute />}>
                      <Route
                        element={<Navigate replace to="/games" />}
                        path="/"
                      />
                      <Route element={<Games />} path="/games" />
                      <Route element={<GameDetail />} path="/games/:gameID" />
                      <Route
                        element={<PrintView />}
                        path="/games/:gameID/print"
                      />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ModalsProvider>
          </MantineProvider>
        </AuthProvider>
      </ErrorBoundary>
    </I18nextProvider>
  </Provider>
);

export default App;
