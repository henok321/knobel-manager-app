import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';

import Footer from './Footer.tsx';
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
  <AppShell
    footer={{ height: 'auto' }}
    header={{ height: 60 }}
    padding={0}
    style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}
  >
    <AppShell.Header>
      <Header navbarActive={navbarActive} onOpenGameForm={onOpenGameForm} />
    </AppShell.Header>
    <AppShell.Main style={{ flex: 1 }}>{children}</AppShell.Main>
    <AppShell.Footer>
      <Footer />
    </AppShell.Footer>
  </AppShell>
);

export default Layout;
