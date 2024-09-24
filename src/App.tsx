import { useDisclosure } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './navigation/Sidebar.tsx';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';
import Login from './auth/Login.tsx';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
      </Routes>
      <Sidebar isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
