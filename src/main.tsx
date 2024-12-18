import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createTheme } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import Login from './pages/Login.tsx';

export const appTheme = createTheme();

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          { path: '/home', element: <HomePage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
