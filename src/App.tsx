import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useUser from './auth/authHook.ts';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';

const App = () => {
  const { userState } = useUser();

  return userState.user ? (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  ) : (
    <Login />
  );
};

export default App;
