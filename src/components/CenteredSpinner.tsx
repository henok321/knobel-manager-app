import { Flex, Spinner } from '@chakra-ui/react';

export const CenteredSpinner = () => (
  <Flex minH="100vh" align="center" justify="center">
    <Spinner
      borderWidth="4px"
      animationDuration="0.65s"
      color="blue.500"
      size="xl"
    />
  </Flex>
);
