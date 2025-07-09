import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';

import Header from './Header';
import NavBar from './NavBar';

interface LayoutProps {
  displayNavBar?: boolean;
  navBarOpened?: boolean;
  logoutButton?: boolean;
  center?: boolean;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navBarOpened, center, children }) => (
  <AppShell
    header={{ height: 60 }}
    navbar={{
      width: 300,
      breakpoint: 'sm',
      collapsed: { mobile: !navBarOpened },
    }}
    padding="md"
  >
    <AppShell.Header>
      <Header />
    </AppShell.Header>

    <AppShell.Navbar p="md">
      <NavBar />
    </AppShell.Navbar>

    <AppShell.Main
      style={{
        display: 'flex',
        justifyContent: center ? 'center' : 'flex-start',
        alignItems: center ? 'center' : 'flex-start',
      }}
    >
      {children}
    </AppShell.Main>
  </AppShell>
);

export default Layout;
