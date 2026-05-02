import { AppShell } from '@mantine/core';
import type React from 'react';
import type { ReactNode } from 'react';

import Footer from './Footer.tsx';
import Header from './Header.tsx';

interface LayoutProps {
  navbarActive?: boolean;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navbarActive, children }) => (
  <AppShell
    footer={{ height: { base: '5rem', sm: '3.5rem' } }}
    header={{ height: '3.75rem' }}
    padding={0}
  >
    <AppShell.Header>
      <Header navbarActive={navbarActive} />
    </AppShell.Header>
    <AppShell.Main>{children}</AppShell.Main>
    <AppShell.Footer>
      <Footer />
    </AppShell.Footer>
  </AppShell>
);

export default Layout;
