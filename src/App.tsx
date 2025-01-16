import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import Games from './pages/games/Games.tsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
