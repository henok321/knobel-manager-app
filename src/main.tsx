import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import store from './store/store.ts';
import './index.css';
import i18n from './i18n/i18nConfig.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Provider>
  </StrictMode>,
);
