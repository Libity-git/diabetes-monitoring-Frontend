import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService';
import {
  Menu,
  LogOut,
  Bell,
  User,
  AlertTriangle,
  UserPlus,
  Droplets,
  Heart,
  Check,
  CheckCheck,
  X,
  Loader2,
} from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'high_risk':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'new_patient':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'high_sugar':
        return <Droplets className="w-4 h-4 text-amber-500" />;
      case 'high_pressure':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'high_risk':
        return 'bg-red-50 border-red-200';
      case 'new_patient':
        return 'bg-blue-50 border-blue-200';
      case 'high_sugar':
        return 'bg-amber-50 border-amber-200';
      case 'high_pressure':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return notifDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 transition-all duration-300 flex items-center justify-between px-4 lg:px-6",
        isSidebarOpen ? "left-0 lg:left-64" : "left-0 lg:left-20"
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-slate-800">
            ระบบติดตามสุขภาพผู้ป่วยเบาหวาน
          </h2>
          <p className="text-xs text-slate-500">
            Diabetes Monitoring System
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold text-slate-800">การแจ้งเตือน</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount} ใหม่
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    อ่านทั้งหมด
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Bell className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
                          !notification.isRead && "bg-blue-50/50"
                        )}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg border",
                            getNotificationColor(notification.type)
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 bg-slate-50 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to notifications page if exists
                    }}
                  >
                    ดูทั้งหมด
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-slate-200">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800">ผู้ดูแลระบบ</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
