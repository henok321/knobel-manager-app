import Layout from './Layout.tsx';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">{t('HOME_PAGE_HEADLINE')}</h1>
      </div>
    </Layout>
  );
};

export default Home;
