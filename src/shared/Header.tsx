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
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import classes from './Header.module.css';
import LanguagePicker from './LanguagePicker';
import { useAuth } from '../auth/useAuth';
import GameContextSelector from '../components/GameContextSelector';

interface NavItem {
  path: string;
  label: string;
}

interface HeaderProps {
  navbarActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navbarActive }) => {
  const [opened, { toggle }] = useDisclosure(false);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut } = useAuth();

  const navItem: NavItem[] = [{ path: '/games', label: t('header.nav.games') }];

  const [active, setActive] = useState(location.pathname);

  const handleNavClick = (path: string) => {
    setActive(path);
    toggle();
  };

  const desktopItems = navItem.map(({ path, label }) => (
    <NavLink
      key={path}
      className={classes.link}
      data-active={active === path || undefined}
      to={path}
      onClick={() => setActive(path)}
    >
      {label}
    </NavLink>
  ));

  const mobileItems = navItem.map(({ path, label }) => (
    <NavLink
      key={path}
      className={classes.mobileLink}
      data-active={active === path || undefined}
      to={path}
      onClick={() => handleNavClick(path)}
    >
      {label}
    </NavLink>
  ));

  return (
    <>
      <Container className={classes.inner} size="md">
        <Title
          className={classes.appTitle}
          order={3}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🎲 {t('header.heading', 'Knobel Manager')}
        </Title>

        {navbarActive && (
          <>
            <Group className={classes.navGroup} gap="md" visibleFrom="xs">
              <GameContextSelector />
              <Group className={classes.linkGroup}>{desktopItems}</Group>
            </Group>

            <Group gap="xs" visibleFrom="xs">
              <LanguagePicker />
              <Menu position="bottom-end" shadow="md" width={200}>
                <Menu.Target>
                  <Button size="sm" variant="subtle">
                    👤
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={logOut}>
                    <Text c="red" fw={500}>
                      {t('header.logout')}
                    </Text>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Burger
              hiddenFrom="xs"
              opened={opened}
              size="sm"
              onClick={toggle}
            />
          </>
        )}

        {!navbarActive && <LanguagePicker />}
      </Container>

      <Drawer
        opened={opened}
        position="right"
        size="xs"
        title={t('header.heading', 'Knobel Manager')}
        onClose={toggle}
      >
        <Stack gap="md">
          <GameContextSelector />

          <Divider />

          <Stack gap="xs">{mobileItems}</Stack>

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
