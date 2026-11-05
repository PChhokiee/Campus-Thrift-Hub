import { create } from 'zustand';
import { defaultFilters } from '@/lib/filters';

export const useFilterStore = create((set) => ({
  filters: { ...defaultFilters },
  sort: 'newest',
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  setSort: (sort) => set({ sort }),
  reset: () => set({ filters: { ...defaultFilters }, sort: 'newest' }),
}));
