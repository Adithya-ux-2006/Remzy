import { create } from 'zustand';

let nextId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ message, type = 'info', duration = 4000 }) => {
    const id = ++nextId;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (message, opts) => get().addToast({ message, type: 'success', ...opts }),
  error: (message, opts) => get().addToast({ message, type: 'error', duration: 6000, ...opts }),
  info: (message, opts) => get().addToast({ message, type: 'info', ...opts }),
}));
