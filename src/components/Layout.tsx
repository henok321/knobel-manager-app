import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  navBar?: boolean;
  logoutButton?: boolean;
  center?: boolean; // <-- our toggle for content centering
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  navBar,
  logoutButton,
  center,
  children,
}) => (
  <div className="flex min-h-screen flex-col bg-gray-100">
    <Header logoutButton={logoutButton} navBar={navBar} />
    <main
      className={`grow p-4 pt-36 ${
        center ? 'flex items-center justify-center' : ''
      }`}
    >
      {children}
    </main>
  </div>
);

export default Layout;
