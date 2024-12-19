import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div>
    <header>
      <h1>Header</h1>
    </header>

    <nav>
      <ul>
        <li>Home</li>
        <li>Game</li>
      </ul>
    </nav>

    <main>{children}</main>
  </div>
);

export default Layout;
