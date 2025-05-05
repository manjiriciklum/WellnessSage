import React from 'react';
import { formatDate } from '@/lib/utils';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import { ActionMenu } from './action-menu';
import { UserProfile } from '@/components/auth/user-profile';
import { useAuth } from '@/hooks/use-auth';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const today = formatDate(new Date());
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-neutral-700 p-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-600 shadow-sm">
      <div>
        <h1 className="text-xl font-headings font-semibold text-neutral-800 dark:text-white">{title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-300">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        {user && <NotificationPanel />}
        <UserProfile />
        <ActionMenu />
      </div>
    </header>
  );
}
