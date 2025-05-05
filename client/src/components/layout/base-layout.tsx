import React from 'react';
import { Header } from '@/components/layout/header';

interface BaseLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function BaseLayout({ children, hideHeader = false }: BaseLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!hideHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}