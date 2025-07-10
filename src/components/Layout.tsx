import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';

import Header from './Header';

interface LayoutProps {
  navbarActive?: boolean;
  center?: boolean;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navbarActive, center, children }) => (
  <AppShell header={{ height: 60 }} padding="md">
    <AppShell.Header>
      <Header navbarActive={navbarActive} />
    </AppShell.Header>

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
