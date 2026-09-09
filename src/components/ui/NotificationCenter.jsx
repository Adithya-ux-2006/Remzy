import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Check, Clock, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNotificationStore } from '../../store/notificationStore';

function NotificationItem({ notification, onRead }) {
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-border-subtle last:border-0 transition-colors',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        notification.type === 'reminder' && 'bg-violet-500/10 text-violet-500',
        notification.type === 'schedule' && 'bg-emerald-500/10 text-emerald-500',
        notification.type === 'info' && 'bg-blue-500/10 text-blue-500',
      )}>
        {notification.type === 'reminder' ? <Clock className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !notification.read ? 'font-semibold text-ink' : 'text-ink')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-[11px] text-ink-muted/70 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <button
          onClick={() => onRead(notification.id)}
          className="shrink-0 p-1 text-ink-muted hover:text-primary rounded-full transition-colors"
          aria-label="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isLoading = useNotificationStore((s) => s.isLoading);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors',
          isOpen ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:text-ink hover:bg-accent'
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-card rounded-2xl border border-border shadow-card-lg overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-ink">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary-dark font-medium px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-ink-muted hover:text-ink rounded-full hover:bg-surface transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[50vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-ink-muted" />
                  </div>
                  <p className="text-sm font-medium text-ink">No notifications yet</p>
                  <p className="text-xs text-ink-muted mt-1">We&apos;ll notify you when your reminders are due.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border px-4 py-2.5">
                <Link
                  to="/reminders"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  View all reminders
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
