import { Box, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
const NavBar = () => {
  const { t } = useTranslation();
  const linkData = [
    { to: '/', label: t('header.nav.home') },
    { to: '/games', label: t('header.nav.games') },
  ];
  return (
    <Box
      component="nav"
      style={{
        padding: '1rem',
      }}
    >
      <Stack gap="xs">
        {linkData.map(({ to, label }) => (
          <NavLink
            key={to}
            style={({ isActive }) => ({
              fontWeight: isActive ? 700 : 400,
              color: isActive ? '#1D4ED8' : 'inherit',
              textDecoration: isActive ? 'underline' : 'none',
              padding: '0.5rem 0',
              display: 'block',
            })}
            to={to}
          >
            {label}
          </NavLink>
        ))}
      </Stack>
    </Box>
  );
};

export default NavBar;
