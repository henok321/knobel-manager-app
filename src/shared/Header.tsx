import {
  Burger,
  Button,
  Container,
  Drawer,
  Divider,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import classes from './Header.module.css';
import LanguagePicker from './LanguagePicker';
import { useAuth } from '../auth/useAuth';

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
  const { logOut } = useAuth();

  const navItem: NavItem[] = [
    { path: '/', label: t('header.nav.home') },
    { path: '/games', label: t('header.nav.games') },
  ];

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
        <Title className={classes.appTitle} order={3}>
          {t('header.heading', 'Knobel Manager')}
        </Title>

        {navbarActive && (
          <Group className={classes.navGroup} visibleFrom="xs">
            <Group className={classes.linkGroup}>{desktopItems}</Group>
          </Group>
        )}

        <LanguagePicker />

        {navbarActive && (
          <Button
            className={classes.logoutButton}
            color="red"
            radius="md"
            size="sm"
            variant="outline"
            onClick={logOut}
          >
            {t('header.logout')}
          </Button>
        )}

        {navbarActive && (
          <Burger hiddenFrom="xs" opened={opened} size="sm" onClick={toggle} />
        )}
      </Container>

      <Drawer
        opened={opened}
        position="right"
        size="xs"
        title={t('header.heading', 'Knobel Manager')}
        onClose={toggle}
      >
        <Stack gap="md">
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
