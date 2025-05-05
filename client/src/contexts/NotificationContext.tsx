import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '@/lib/notificationService';
import Notification from '@/components/ui/Notification';

type NotificationType = 'info' | 'warning' | 'success' | 'error';

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string | number) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {}
});

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showToast, setShowToast] = useState<boolean>(true);
  
  // Connect to WebSocket when userId is available
  useEffect(() => {
    if (userId) {
      notificationService.connect(userId);
      
      return () => {
        notificationService.disconnect();
      };
    }
  }, [userId]);
  
  // Setup notification listeners
  useEffect(() => {
    if (!userId) return;
    
    // Handle incoming reminders
    const handleReminders = (reminders: any[]) => {
      reminders.forEach(reminder => {
        addNotification({
          title: reminder.title,
          message: `${reminder.category} reminder: ${reminder.time}`,
          type: 'info'
        });
      });
    };
    
    // Handle incoming insights (alerts)
    const handleInsights = (insights: any[]) => {
      insights.forEach(insight => {
        addNotification({
          title: insight.title,
          message: insight.description,
          type: 'warning'
        });
      });
    };
    
    // Handle new single reminder
    const handleNewReminder = (reminder: any) => {
      addNotification({
        title: 'New Reminder',
        message: reminder.title,
        type: 'info'
      });
    };
    
    // Handle new single insight
    const handleNewInsight = (insight: any) => {
      addNotification({
        title: 'New Health Insight',
        message: insight.title,
        type: 'warning'
      });
    };
    
    // Register handlers
    notificationService.addListener('reminders', handleReminders);
    notificationService.addListener('insights', handleInsights);
    notificationService.addListener('new_reminder', handleNewReminder);
    notificationService.addListener('new_insight', handleNewInsight);
    
    // Cleanup on unmount
    return () => {
      notificationService.removeListener('reminders', handleReminders);
      notificationService.removeListener('insights', handleInsights);
      notificationService.removeListener('new_reminder', handleNewReminder);
      notificationService.removeListener('new_insight', handleNewInsight);
    };
  }, [userId]);
  
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    // Create a unique ID by combining timestamp with a random string
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date();
    
    setNotifications(prev => [
      ...prev,
      { ...notification, id, timestamp, read: false }
    ]);
  };
  
  const removeNotification = (id: string | number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  const markAsRead = (id: string | number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
      
      {/* Render toast notifications only for unread ones */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[9999] space-y-4 w-96 max-w-full pointer-events-auto">
          {notifications
            .filter(notification => !notification.read)
            .slice(0, 3) // Only show the 3 most recent
            .map(notification => (
              <Notification
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                type={notification.type as any} // Type compatibility fix
                onClose={() => markAsRead(notification.id)}
              />
            ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
export default NotificationContext;