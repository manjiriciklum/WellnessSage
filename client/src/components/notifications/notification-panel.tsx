import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotification } from '@/contexts/NotificationContext';

interface NotificationType {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, clearNotifications } = useNotification();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const recentNotifications = notifications.filter((n: any) => !n.read).slice(0, 3);
  const olderNotifications = notifications.filter((n: any) => n.read || recentNotifications.includes(n));
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);
  
  const handleMarkAsRead = (id: string | number) => {
    markAsRead(id);
  };
  
  const getNotificationColor = (type: NotificationType['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative p-2 rounded-full" 
        onClick={togglePanel}
      >
        <Bell size={20} className="text-neutral-600 dark:text-neutral-300" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 p-0 text-[10px] bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50 origin-top-right">
          <Card className="shadow-lg border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
              <h3 className="font-medium text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={clearNotifications}>
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-xs h-7 w-7 p-0" onClick={() => setIsOpen(false)}>
                  <X size={14} />
                </Button>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {recentNotifications.length > 0 && (
                <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1">Recent</p>
                </div>
              )}
              
              {recentNotifications.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 -mt-1 -mr-1" 
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle size={14} className="text-slate-400 hover:text-green-500" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className={cn("text-[10px] py-0 h-5", getNotificationColor(notification.type))}>
                          {notification.type}
                        </Badge>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                </div>
              )}

              {olderNotifications.length > 0 && (
                <>
                  <div className="p-2 border-y border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1">Earlier</p>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {olderNotifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors opacity-75"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className={cn("text-[10px] py-0 h-5", getNotificationColor(notification.type))}>
                            {notification.type}
                          </Badge>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {olderNotifications.length > 5 && (
                      <div className="p-2 text-center">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View all ({olderNotifications.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}