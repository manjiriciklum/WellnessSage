import React from 'react';
import { BaseLayout } from './layout/base-layout';
import { Header } from './layout/header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <BaseLayout>
      <Header />
      <main className="flex-1 p-4">
        {children}
      </main>
    </BaseLayout>
  );
};

export default Layout; 