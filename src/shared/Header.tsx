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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import classes from './Header.module.css';
import LanguagePicker from './LanguagePicker';
import { useAuth } from '../auth/useAuth';
import GameContextSelector from '../components/GameContextSelector';
import UserMenu from '../components/UserMenu';

interface HeaderProps {
  navbarActive?: boolean;
  onOpenGameForm?: () => void;
}

const Header: React.FC<HeaderProps> = ({ navbarActive, onOpenGameForm }) => {
  const [opened, { toggle }] = useDisclosure(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

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
          {/* Left: Logo */}
          <Group
            gap="xs"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <ThemeIcon size="lg" variant="light">
              <IconDice />
            </ThemeIcon>
            <Title className={classes.appTitle} fw={700} order={4}>
              {t('header.heading', 'Knobel Manager')}
            </Title>
          </Group>

          {/* Center: Game Context Selector (Desktop) */}
          {navbarActive && (
            <Box
              style={{
                flex: 1,
                maxWidth: 400,
                marginInline: 'auto',
              }}
              visibleFrom="sm"
            >
              <GameContextSelector onOpenGameForm={onOpenGameForm} />
            </Box>
          )}

          {/* Right: User Menu (Desktop) */}
          {navbarActive && (
            <Group gap="xs" visibleFrom="sm">
              <UserMenu onLogout={logOut} />
            </Group>
          )}

          {/* Language Picker for Login Page */}
          {!navbarActive && <LanguagePicker />}

          {/* Mobile Burger */}
          {navbarActive && (
            <Burger
              hiddenFrom="sm"
              opened={opened}
              size="sm"
              onClick={toggle}
            />
          )}
        </Group>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        position="right"
        size="xs"
        title={t('header.heading', 'Knobel Manager')}
        onClose={toggle}
      >
        <Stack gap="md">
          <GameContextSelector
            isMobile
            onClose={toggle}
            onOpenGameForm={onOpenGameForm}
          />

          <Divider />

          <Group justify="space-between">
            <Text fw={500} size="sm">
              {t('header.nav.language')}
            </Text>
            <LanguagePicker
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
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
