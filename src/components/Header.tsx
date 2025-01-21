import React from 'react';
import { useAuth } from '../auth/useAuth.ts';
import { useTranslation } from 'react-i18next';
import { NavBar } from './NavBar.tsx';

interface HeaderProps {
  navBar?: boolean;
  logoutButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navBar, logoutButton }) => {
  const { logOut } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 z-10 w-full bg-blue-500 shadow-md">
      <hgroup className="flex items-center justify-between p-4 text-white">
        <h1 className="text-2xl font-bold">{t('header.heading')}</h1>
        {logoutButton && (
          <button
            onClick={logOut}
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            {t('header.logout')}
          </button>
        )}
      </hgroup>

      {navBar && <NavBar />}
    </header>
  );
};

export default Header;
