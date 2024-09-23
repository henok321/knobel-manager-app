import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ChakraProvider } from '@chakra-ui/react';
import i18n from './i18n/i18n.ts';
import { I18nextProvider } from 'react-i18next';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ChakraProvider>
  </StrictMode>,
);
