import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import Games from './pages/games/Games.tsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Login />} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route element={<Home />} path="/" />
          <Route element={<Games />} path="/games" />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
