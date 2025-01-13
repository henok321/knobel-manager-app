import Layout from './Layout.tsx';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-4">${t('HOME_PAGE_HEADLINE')}</h1>
      </div>
    </Layout>
  );
};

export default Home;
