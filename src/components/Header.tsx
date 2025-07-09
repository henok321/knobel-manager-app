import { Box, Group, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Group h="100%" px="md">
        <Title order={1}>{t('header.heading')}</Title>
      </Group>
    </Box>
  );
};
export default Header;
