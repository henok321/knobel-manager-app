import { Anchor, Box, Group } from '@mantine/core';
import { Link } from 'react-router';

import { useAuth } from '../../auth/useAuth.ts';
import Logo from '../Logo.tsx';
import UserMenu from '../userMenu/UserMenu.tsx';

const Header = () => {
  const { user } = useAuth();

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
        <Anchor component={Link} to="/" underline="never">
          <Logo variant="full" />
        </Anchor>

        {user && <UserMenu />}
      </Group>
    </Box>
  );
};

export default Header;
