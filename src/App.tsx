import Sidebar from './navigation/Sidebar.tsx';
import { StrictMode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n.ts';

const App = () => (
  <>
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <Sidebar />
      </I18nextProvider>
    </StrictMode>
  </>
);

export default App;
