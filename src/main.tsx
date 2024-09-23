import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ChakraProvider } from '@chakra-ui/react';
import i18n from './i18n/i18n.ts';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import store from './store/store.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ChakraProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ChakraProvider>
    </Provider>
  </StrictMode>,
);
