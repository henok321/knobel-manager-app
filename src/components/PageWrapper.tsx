import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => (
  <Box ml={{ base: 0, md: 60 }} p="4">
    {children}
  </Box>
);

export default PageWrapper;
