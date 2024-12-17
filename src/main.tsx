import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import i18n from './i18n/i18n.ts';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import store from './store/store.ts';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { CssBaseline } from '@mui/material';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <CssBaseline />
        <App />
      </I18nextProvider>
    </Provider>
  </StrictMode>,
);
