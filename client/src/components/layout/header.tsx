import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { User, Settings, Menu } from 'lucide-react';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import { useUser } from '@/hooks/use-user';

export function Header() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border/40 backdrop-blur">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        {/* Logo and brand */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <a className="font-bold text-xl text-primary flex items-center">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Health<span className="font-light">Tracker</span>
              </span>
            </a>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </a>
          </Link>
          <Link href="/health-insights">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Health Insights
            </a>
          </Link>
          <Link href="/wellness-plans">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Wellness Plans
            </a>
          </Link>
          <Link href="/find-doctor">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Find Doctor
            </a>
          </Link>
          <Link href="/alerts-reminders">
            <a className="text-sm font-medium transition-colors hover:text-primary">
              Alerts & Reminders
            </a>
          </Link>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center space-x-1">
          {/* Notification bell */}
          <NotificationPanel />

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full" 
            onClick={() => setLocation('/settings')}
          >
            <Settings size={20} className="text-neutral-600 dark:text-neutral-300" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User profile */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full" 
            onClick={() => setLocation('/profile')}
          >
            <User size={20} className="text-neutral-600 dark:text-neutral-300" />
            <span className="sr-only">Profile</span>
          </Button>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-full md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} className="text-neutral-600 dark:text-neutral-300" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden">
          <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-4 right-4" 
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-xl">&times;</span>
            </Button>
            
            <nav className="flex flex-col items-center space-y-6">
              <Link href="/dashboard">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </a>
              </Link>
              <Link href="/health-insights">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Health Insights
                </a>
              </Link>
              <Link href="/wellness-plans">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Wellness Plans
                </a>
              </Link>
              <Link href="/find-doctor">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Find Doctor
                </a>
              </Link>
              <Link href="/alerts-reminders">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Alerts & Reminders
                </a>
              </Link>
              <Link href="/connected-devices">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Connected Devices
                </a>
              </Link>
              <Link href="/settings">
                <a className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Settings
                </a>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}