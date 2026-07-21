import { Box, Group } from '@mantine/core';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

import Logo from '../Logo.tsx';
import UserMenu from '../userMenu/UserMenu.tsx';

interface HeaderProps {
  navbarActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navbarActive }) => {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        borderBottom:
          '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
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
        <Box
          style={{ cursor: 'pointer' }}
          onClick={() => {
            void navigate('/');
          }}
        >
          <Logo size={16} variant="full" />
        </Box>

        {navbarActive && (
          <Group gap="xs">
            <UserMenu />
          </Group>
        )}
      </Group>
    </Box>
  );
};

export default Header;
