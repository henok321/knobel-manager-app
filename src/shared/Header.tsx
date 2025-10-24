import {
  Burger,
  Button,
  Container,
  Drawer,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import classes from './Header.module.css';
import LanguagePicker from './LanguagePicker';
import { useAuth } from '../auth/useAuth';
import GameContextSelector from '../components/GameContextSelector';

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
      <div
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Container size="xl">
          <Group
            align="center"
            h={60}
            justify="space-between"
            px="md"
            wrap="nowrap"
          >
            {/* Left: Logo */}
            <Title
              className={classes.appTitle}
              order={3}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              🎲 {t('header.heading', 'Knobel Manager')}
            </Title>

            {/* Center: Game Context Selector (Desktop) */}
            {navbarActive && (
              <Group gap="md" style={{ flex: 1 }} visibleFrom="xs">
                <GameContextSelector onOpenGameForm={onOpenGameForm} />
              </Group>
            )}

            {/* Right: User Menu (Desktop) */}
            {navbarActive && (
              <Group gap="xs" visibleFrom="xs">
                <Menu position="bottom-end" shadow="md" width={200}>
                  <Menu.Target>
                    <Button size="sm" variant="subtle">
                      👤
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{t('header.nav.settings')}</Menu.Label>
                    <Menu.Item closeMenuOnClick={false}>
                      <Group justify="space-between">
                        <Text size="sm">{t('header.nav.language')}</Text>
                        <LanguagePicker
                          currentLanguage={currentLanguage}
                          onLanguageChange={setCurrentLanguage}
                        />
                      </Group>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item onClick={logOut}>
                      <Text c="red" fw={500}>
                        {t('header.logout')}
                      </Text>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}

            {/* Language Picker for Login Page */}
            {!navbarActive && <LanguagePicker />}

            {/* Mobile Burger */}
            {navbarActive && (
              <Burger
                hiddenFrom="xs"
                opened={opened}
                size="sm"
                onClick={toggle}
              />
            )}
          </Group>
        </Container>
      </div>

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
