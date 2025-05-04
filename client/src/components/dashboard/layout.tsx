import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/topbar';
import { useLocation } from 'wouter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/health-insights':
        return 'Health Insights';
      case '/connected-devices':
        return 'Connected Devices';
      case '/wellness-plans':
        return 'Wellness Plans';
      case '/find-doctor':
        return 'Find a Doctor';
      case '/alerts-reminders':
        return 'Alerts & Reminders';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 bg-neutral-50 dark:bg-neutral-800 min-h-screen">
        <TopBar title={getPageTitle()} />
        {children}
      </main>
    </div>
  );
}
