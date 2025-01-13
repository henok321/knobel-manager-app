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
    <div className=" flex min-h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 z-10 flex w-full items-center justify-between bg-blue-500 p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold">{t('HEADER_TITLE')}</h1>
        <button
          onClick={logOut}
          className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
        >
          {t('LOGOUT_BUTTON')}
        </button>
      </header>

      <div className="pt-16">
        {/* Navigation */}
        <nav className="border-b border-gray-300 bg-gray-200 p-4">
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `cursor-pointer transition-colors hover:text-blue-500 ${
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
                  `cursor-pointer transition-colors hover:text-blue-500 ${
                    isActive ? 'font-bold text-blue-700 underline' : ''
                  }`
                }
              >
                {t('NAV_GAMES')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="grow p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
