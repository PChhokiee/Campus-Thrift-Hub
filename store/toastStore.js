import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toast: null, // { id, title, body, type, path }
  show: (t) => set({ toast: { id: Date.now() + Math.random(), type: 'info', ...t } }),
  hide: () => set({ toast: null }),
}));

export const showError = (message) => useToastStore.getState().show({ title: message, type: 'error' });
export const showSuccess = (message) => useToastStore.getState().show({ title: message, type: 'success' });
