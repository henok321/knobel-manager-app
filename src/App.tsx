import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import Login from './auth/Login.tsx';
import { SidebarProvider } from './sidebar/SidebarContext.tsx';

const App = () => (
  <SidebarProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </SidebarProvider>
);

export default App;
