import { Box, useColorModeValue } from '@chakra-ui/react';
import { ReactNode, useContext } from 'react';
import Sidebar from '../sidebar/Sidebar.tsx';
import SidebarContext from '../sidebar/SidebarContext.tsx';

interface PageWrapperProps {
  children: ReactNode;
}

const Layout = ({ children }: PageWrapperProps) => {
  const { isOpen, onClose, onOpen } = useContext(SidebarContext);

  return (
    <>
      <Sidebar onClose={onClose} onOpen={onOpen} isOpen={isOpen} />
      <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
        <Box ml={{ base: 0, md: 60 }} p="4">
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
