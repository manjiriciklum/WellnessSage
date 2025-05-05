import React, { useEffect, useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'reminder' | 'success';
  duration?: number;
  onClose: (id: string | number) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Auto dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);
  
  useEffect(() => {
    // When no longer visible, trigger the onClose callback
    if (!isVisible) {
      const timer = setTimeout(() => onClose(id), 300); // Allow animation to complete
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, id]);
  
  // Set icon and color based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case 'alert':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'reminder':
        return {
          icon: <Bell className="h-5 w-5" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600'
        };
      case 'info':
      default:
        return {
          icon: <Bell className="h-5 w-5" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-sm rounded-lg shadow-lg border overflow-hidden ${styles.bgColor} ${styles.borderColor}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${styles.iconColor}`}>
                {styles.icon}
              </div>
              
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={`text-sm font-medium ${styles.textColor}`}>{title}</p>
                <p className={`mt-1 text-sm ${styles.textColor} opacity-90`}>{message}</p>
              </div>
              
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  className={`bg-transparent rounded-md inline-flex ${styles.textColor} hover:${styles.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  onClick={() => setIsVisible(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;