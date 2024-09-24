import { Box, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
    <Box ml={{ base: 0, md: 60 }} p="4">
      {children}
    </Box>
  </Box>
);

export default PageWrapper;
