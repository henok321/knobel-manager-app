import { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth.ts';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center fixed top-0 w-full z-10 shadow-md">
        <h1 className="text-2xl font-bold">{t('HEADER_TITLE')}</h1>
        <button
          onClick={logOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          {t('LOGOUT_BUTTON')}
        </button>
      </header>

      <div className="pt-16">
        {/* Navigation */}
        <nav className="bg-gray-200 p-4 border-b border-gray-300">
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `cursor-pointer hover:text-blue-500 transition-colors ${
                    isActive ? 'font-bold text-blue-700 underline' : ''
                  }`
                }
              >
                {t('NAV_HOME')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/games"
                className={({ isActive }) =>
                  `cursor-pointer hover:text-blue-500 transition-colors ${
                    isActive ? 'font-bold text-blue-700 underline' : ''
                  }`
                }
              >
                {t('NAV_GAMES')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
