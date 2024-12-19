import { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth.ts';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl">Header</h1>
        <button
          onClick={logOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      <nav className="bg-gray-200 p-4">
        <ul className="flex space-x-4">
          <li className="hover:text-blue-500 cursor-pointer">Home</li>
          <li className="hover:text-blue-500 cursor-pointer">Game</li>
        </ul>
      </nav>
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
};

export default Layout;
