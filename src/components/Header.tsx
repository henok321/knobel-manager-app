import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.ts';
import { useTranslation } from 'react-i18next';

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

      {navBar && (
        <nav className="border-b border-gray-300 bg-gray-200 p-4">
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `cursor-pointer transition-colors hover:text-blue-500 ${isActive ? 'font-bold text-blue-700 underline' : ''}`
                }
              >
                {t('header.nav.home')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/games"
                className={({ isActive }) =>
                  `cursor-pointer transition-colors hover:text-blue-500 ${isActive ? 'font-bold text-blue-700 underline' : ''}`
                }
              >
                {t('header.nav.games')}
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
