import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import Login from './auth/Login.tsx';
import { SidebarProvider } from './sidebar/SidebarContext.tsx';
import { AuthRedirect } from './auth/AuthRedirect.tsx';

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
