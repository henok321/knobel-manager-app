import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import i18n from './i18n/i18n.ts';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReactReduxProvider } from 'react-redux';
import store from './store/store.ts';
import { Provider as ChakraProvider } from './components/ui/provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactReduxProvider store={store}>
      <ChakraProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ChakraProvider>
    </ReactReduxProvider>
  </StrictMode>,
);
