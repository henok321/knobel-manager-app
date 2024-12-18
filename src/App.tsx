import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { DashboardLayout, Navigation } from '@toolpad/core';
import Home from './pages/Home';
import Login from './pages/Login';
import useUser from './auth/authHook';
import Settings from './pages/Settings.tsx';

const NAVIGATION: Navigation = [
  { pattern: '/', title: 'Home' },
  { pattern: '/settings', title: 'Settings' },
];

const App = () => {
  const { userState } = useUser();
  return (
    <BrowserRouter>
      <AppProvider navigation={NAVIGATION}>
        {userState.user ? (
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </DashboardLayout>
        ) : (
          <Login />
        )}
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
