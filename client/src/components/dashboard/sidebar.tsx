import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Heart,
  LineChart,
  Watch,
  Bath,
  Stethoscope,
  Bell,
  Settings,
  Menu,
  X,
  Brain
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/hooks/use-user';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LineChart size={18} className="mr-3" />
    },
    {
      name: 'Health Insights',
      path: '/health-insights',
      icon: <Heart size={18} className="mr-3" />
    },
    {
      name: 'Connected Devices',
      path: '/connected-devices',
      icon: <Watch size={18} className="mr-3" />
    },
    {
      name: 'Wellness Plans',
      path: '/wellness-plans',
      icon: <Bath size={18} className="mr-3" />
    },
    {
      name: 'Find a Doctor',
      path: '/find-doctor',
      icon: <Stethoscope size={18} className="mr-3" />
    },
    {
      name: 'Health Coach',
      path: '/health-coach',
      icon: <Brain size={18} className="mr-3" />
    },
    {
      name: 'Alerts & Reminders',
      path: '/alerts-reminders',
      icon: <Bell size={18} className="mr-3" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={18} className="mr-3" />
    }
  ];

  const SidebarContent = (
    <>
      <div className="p-4 flex items-center">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white mr-3">
          <Heart size={16} />
        </div>
        <h1 className="text-xl font-headings font-bold text-neutral-800 dark:text-white">HealthAI</h1>
      </div>
      
      <nav className="mt-6">
        <ul className="px-2 space-y-1">
          {routes.map((route) => (
            <li key={route.path}>
              <Link href={route.path}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md",
                    location === route.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-neutral-600 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {route.icon}
                  {route.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-4">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            {user?.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user?.firstName || ''} />
            ) : (
              <AvatarImage src="" alt={user?.firstName || ''} />
            )}
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-neutral-800 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h3>
            <Link href="/settings">
              <div className="text-xs text-neutral-500 dark:text-neutral-300 hover:underline cursor-pointer">
                View Profile
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-600">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white mr-3">
            <Heart size={16} />
          </div>
          <h1 className="text-xl font-headings font-bold text-neutral-800 dark:text-white">HealthAI</h1>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="text-neutral-500 dark:text-neutral-200">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 max-w-[250px]">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Sidebar */}
      <aside className={cn(
        "bg-white dark:bg-neutral-700 w-64 min-h-screen border-r border-neutral-100 dark:border-neutral-600 fixed hidden md:block",
        className
      )}>
        {SidebarContent}
      </aside>
    </>
  );
}
