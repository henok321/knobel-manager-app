import { useAuth } from '../auth/useAuth.ts';

const Home = () => {
  const { logOut } = useAuth();
  return (
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
  );
};

export default Home;
