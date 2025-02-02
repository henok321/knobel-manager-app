import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  const { t } = useTranslation();

  return (
    <nav className="border-b border-gray-300 bg-gray-200 p-4">
      <ul className="flex space-x-4">
        <li>
          <NavLink
            className={({ isActive }) =>
              `cursor-pointer transition-colors hover:text-blue-500 ${isActive ? 'font-bold text-blue-700 underline' : ''}`
            }
            to="/"
          >
            {t('header.nav.home')}
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) =>
              `cursor-pointer transition-colors hover:text-blue-500 ${isActive ? 'font-bold text-blue-700 underline' : ''}`
            }
            to="/games"
          >
            {t('header.nav.games')}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
