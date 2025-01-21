import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { t } = useTranslation();

  return (
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
  );
};

export default NavBar;
