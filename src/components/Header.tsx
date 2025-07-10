import { Burger, Button, Container, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import classes from './Header.module.css';
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

  const items = navItem.map(({ path, label }) => (
    <NavLink
      key={path}
      className={classes.link}
      data-active={active === path || undefined}
      to={path}
      onClick={() => {
        setActive(path);
      }}
    >
      {label}
    </NavLink>
  ));

  return (
    <header className={classes.header}>
      <Container className={classes.inner} size="md">
        <Title className={classes.appTitle} order={3}>
          {t('header.heading', 'Knobel Manager')}
        </Title>

        {navbarActive && (
          <Group className={classes.navGroup} visibleFrom="xs">
            <Group className={classes.linkGroup}>{items}</Group>
          </Group>
        )}

        {navbarActive && (
          <Button
            className={classes.logoutButton}
            color="red"
            radius="md"
            size="sm"
            variant="outline"
            onClick={logOut}
          >
            {t('header.logout')}{' '}
          </Button>
        )}

        <Burger hiddenFrom="xs" opened={opened} size="sm" onClick={toggle} />
      </Container>
    </header>
  );
};

export default Header;
