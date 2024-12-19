import { useAuth } from '../auth/useAuth.ts';
import Layout from './Layout.tsx';

const Home = () => {
  const { logOut } = useAuth();
  return (
    <Layout>
      <div>
        <h1>Home</h1>
        <p>Hello World</p>
        <button
          type={'button'}
          onClick={() => {
            logOut();
          }}
        >
          Logout
        </button>
      </div>
    </Layout>
  );
};

export default Home;
