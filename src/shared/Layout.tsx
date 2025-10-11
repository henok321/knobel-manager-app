import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';

import Header from './Header';

interface LayoutProps {
  navbarActive?: boolean;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navbarActive, children }) => (
  <AppShell header={{ height: '4rem' }} padding="md">
    <AppShell.Header>
      <Header navbarActive={navbarActive} />
    </AppShell.Header>
    <AppShell.Main>{children}</AppShell.Main>
  </AppShell>
);

export default Layout;
