import { AppShell, Flex } from '@mantine/core';
import React, { ReactNode } from 'react';

import Header from './Header';

interface LayoutProps {
  navbarActive?: boolean;
  center?: boolean;
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ navbarActive, center, children }) => (
  <AppShell>
    <AppShell.Header>
      <Header navbarActive={navbarActive} />
    </AppShell.Header>

    <AppShell.Main>
      {center ? (
        <Flex align="center" justify="center" style={{ height: 'calc(100vh' }}>
          {children}
        </Flex>
      ) : (
        children
      )}
    </AppShell.Main>
  </AppShell>
);

export default Layout;
