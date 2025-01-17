import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout.tsx';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Layout navBar logoutButton>
      <div>
        <h1 className="mb-4 text-2xl font-bold">{t('pages.home.heading')}</h1>
      </div>
    </Layout>
  );
};

export default Home;
