import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import GameDetail from './pages/games/GameDetail.tsx';
import Games from './pages/games/Games.tsx';
import Home from './pages/home/Home.tsx';
import Login from './pages/Login.tsx';
import '@mantine/core/styles.css';

const App = () => (
  <AuthProvider>
    <MantineProvider>
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
    </MantineProvider>
  </AuthProvider>
);

export default App;
