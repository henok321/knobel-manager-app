import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';

import Header from '../header/Header.tsx';

interface LayoutProps {
  navbarActive?: boolean;
  children: ReactNode;
  onOpenGameForm?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  navbarActive,
  children,
  onOpenGameForm,
}) => (
  <AppShell header={{ height: 60 }} padding={0}>
    <AppShell.Header>
      <Header navbarActive={navbarActive} onOpenGameForm={onOpenGameForm} />
    </AppShell.Header>
    <AppShell.Main>{children}</AppShell.Main>
  </AppShell>
);

export default Layout;
