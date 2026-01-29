import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDice } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LanguagePicker from './components/LanguagePicker.tsx';
import UserMenu from './components/UserMenu.tsx';
import { useAuth } from '../auth/useAuth.ts';

interface HeaderProps {
  navbarActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navbarActive }) => {
  const [opened, { toggle }] = useDisclosure(false);
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
              {t('header.heading', 'Knobel Manager')}
            </Title>
          </Group>

          {navbarActive && (
            <Group gap="xs" visibleFrom="md">
              <LanguagePicker />
              <UserMenu onLogout={logOut} />
            </Group>
          )}

          {!navbarActive && <LanguagePicker />}

          {navbarActive && (
            <Burger
              hiddenFrom="md"
              opened={opened}
              size="sm"
              onClick={toggle}
            />
          )}
        </Group>
      </Box>

      <Drawer
        opened={opened}
        position="right"
        size="xs"
        title={t('header.heading', 'Knobel Manager')}
        onClose={toggle}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500} size="sm">
              {t('header.nav.language')}
            </Text>
            <LanguagePicker />
          </Group>

          <Divider />

          <Button
            fullWidth
            color="red"
            size="md"
            variant="outline"
            onClick={() => {
              logOut();
              toggle();
            }}
          >
            {t('header.logout')}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default Header;
