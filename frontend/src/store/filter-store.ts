'use client';

import { create } from 'zustand';
import { useQueryState } from 'nuqs';

type CategoryFilter = 'All' | 'Coffee' | 'Breakfast' | 'Pastries' | 'Sides';

interface FilterState {
  activeFilter: CategoryFilter;
}

interface FilterStore extends FilterState {
  setActiveFilter: (filter: CategoryFilter) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeFilter: 'All',

  setActiveFilter: (filter: CategoryFilter) => {
    set({ activeFilter: filter });
  },
}));

export const useFilterQuery = () => useQueryState(
  'category',
  { defaultValue: 'All' as CategoryFilter }
);
