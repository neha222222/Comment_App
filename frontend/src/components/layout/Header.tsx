import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';
import { Button } from '../ui/button';
import { Bell, LogOut, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentView: 'comments' | 'notifications';
  onViewChange: (view: 'comments' | 'notifications') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await notificationsApi.getAll();
        setUnreadCount(notifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Comment App</h1>
          <nav className="flex gap-2">
            <Button
              variant={currentView === 'comments' ? 'default' : 'ghost'}
              onClick={() => onViewChange('comments')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </Button>
            <Button
              variant={currentView === 'notifications' ? 'default' : 'ghost'}
              onClick={() => onViewChange('notifications')}
              className="relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.username}
          </span>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
