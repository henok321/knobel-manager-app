import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sidebar from './navigation/Sidebar.tsx';
import Home from './pages/Home.tsx';
import Settings from './pages/Settings.tsx';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <BrowserRouter>
      <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
        <Sidebar isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default App;
