import { Outlet } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { CssBaseline } from '@mui/material';
import store from './store/store.ts';
import i18n from 'i18next';
import { Navigation } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Home',
  },
  {
    title: 'Settings',
  },
];
const App = () => (
  <ReduxProvider store={store}>
    <I18nextProvider i18n={i18n}>
      <CssBaseline enableColorScheme />
      <AppProvider navigation={NAVIGATION}>
        <Outlet />
      </AppProvider>
    </I18nextProvider>
  </ReduxProvider>
);

export default App;
