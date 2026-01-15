import {
  Avatar,
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
import { IconDice, IconLogout } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import GameContextSelector from './components/GameContextSelector.tsx';
import LanguagePicker from './components/LanguagePicker.tsx';
import UserMenu from './components/UserMenu.tsx';
import { useAuth } from '../auth/useAuth.ts';

interface HeaderProps {
  navbarActive?: boolean;
  onOpenGameForm?: () => void;
}

const Header: React.FC<HeaderProps> = ({ navbarActive, onOpenGameForm }) => {
  const [opened, { toggle }] = useDisclosure(false);
  const { t } = useTranslation(['common', 'home']);
  const navigate = useNavigate();
  const { user, logOut } = useAuth();

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
            <Box
              style={{
                flex: 1,
                maxWidth: 400,
                marginInline: 'auto',
              }}
              visibleFrom="md"
            >
              <GameContextSelector onOpenGameForm={onOpenGameForm} />
            </Box>
          )}

          {navbarActive && (
            <Group gap="xs" visibleFrom="md">
              <UserMenu />
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
        <Stack gap="lg">
          {/* Tournament Section */}
          <Stack gap="xs">
            <Text c="dimmed" fw={600} size="xs" tt="uppercase">
              {t('picker.activeTournament', { ns: 'home' })}
            </Text>
            <GameContextSelector
              isMobile
              onClose={toggle}
              onOpenGameForm={onOpenGameForm}
            />
          </Stack>

          <Divider />

          {/* Account Section */}
          <Stack gap="sm">
            <Text c="dimmed" fw={600} size="xs" tt="uppercase">
              {t('header.account')}
            </Text>
            <Group gap="xs">
              <Avatar color="blue" radius="xl" size="sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Text fw={500} size="sm">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm">{t('header.nav.language')}</Text>
              <LanguagePicker />
            </Group>

            <Button
              fullWidth
              color="red"
              leftSection={<IconLogout style={{ width: 16, height: 16 }} />}
              variant="light"
              onClick={() => {
                logOut();
                toggle();
              }}
            >
              {t('header.logout')}
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default Header;
