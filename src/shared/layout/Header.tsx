import { Box, Group, ThemeIcon, Title } from '@mantine/core';
import { IconDice } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/useAuth.ts';
import UserMenu from '../userMenu/UserMenu.tsx';

interface HeaderProps {
  navbarActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navbarActive }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logOut } = useAuth();

  return (
    <>
      <Box
        style={{
          borderBottom:
            '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group
          align="center"
          h={60}
          justify="space-between"
          maw={1440}
          mx="auto"
          px="xl"
          wrap="nowrap"
        >
          <Group
            gap="xs"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <ThemeIcon size="lg" variant="light">
              <IconDice />
            </ThemeIcon>
            <Title fw={700} order={4}>
              {t('common:header.heading', 'Knobel Manager')}
            </Title>
          </Group>

          {navbarActive && (
            <Group gap="xs">
              <UserMenu onLogout={logOut} />
            </Group>
          )}
        </Group>
      </Box>
    </>
  );
};

export default Header;
