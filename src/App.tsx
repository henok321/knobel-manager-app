import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import { SidebarProvider } from './sidebar/SidebarContext.tsx';
import useUser from './auth/authHook.ts';
import Login from './pages/Login.tsx';
import UserProfile from './pages/UserProfile.tsx';
import GamesOverview from './pages/GamesOverview.tsx';

const App = () => {
  const { userState } = useUser();

  return userState.user ? (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/games" element={<GamesOverview />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  ) : (
    <Login />
  );
};

export default App;
