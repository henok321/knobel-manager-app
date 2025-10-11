import { Flex, Loader } from '@mantine/core';

const CenterLoader = () => (
  <Flex align="center" justify="center" style={{ height: '100vh' }}>
    <Loader size="xl" />
  </Flex>
);

export default CenterLoader;
