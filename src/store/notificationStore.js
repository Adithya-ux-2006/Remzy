import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  pushSubscription: null,
  pushPermission: typeof Notification !== 'undefined' ? Notification.permission : 'default',

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications = data || [];
      const unreadCount = notifications.filter((n) => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      set((state) => {
        const notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const notifications = [notification, ...state.notifications];
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  clear: () => set({ notifications: [], unreadCount: 0 }),

  requestPushPermission: async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const permission = await Notification.requestPermission();
    set({ pushPermission: permission });
    return permission;
  },

  registerPushSubscription: async () => {
    if (typeof Notification === 'undefined' || typeof navigator === 'undefined') return null;

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || undefined,
      });

      const user = useAuthStore.getState().user;
      if (user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: JSON.parse(JSON.stringify(subscription)).keys?.p256dh || '',
          auth: JSON.parse(JSON.stringify(subscription)).keys?.auth || '',
        }, { onConflict: 'endpoint' });
      }

      set({ pushSubscription: subscription });
      return subscription;
    } catch (error) {
      console.error('Error registering push subscription:', error);
      return null;
    }
  },

  sendBrowserNotification: (title, options = {}) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        ...options,
      });
    } catch (error) {
      console.error('Error sending browser notification:', error);
    }
  },

  clearPushSubscription: async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      set({ pushSubscription: null });
    } catch (error) {
      console.error('Error clearing push subscription:', error);
    }
  },
}));
