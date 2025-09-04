// App Store for UI State Management
// Story 1.4: Basic Family Dashboard

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Store state interface
interface AppStore {
  // Week navigation state
  currentWeek: Date;
  
  // Family member filter state
  selectedFamilyMemberId?: string;
  
  // UI state
  showQuickAdd: boolean;
  isLoading: boolean;
  
  // Actions
  setCurrentWeek: (date: Date) => void;
  setSelectedFamilyMember: (id?: string) => void;
  setShowQuickAdd: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Utility methods
  resetFilters: () => void;
}

// Create the store
export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentWeek: new Date(),
      selectedFamilyMemberId: undefined,
      showQuickAdd: false,
      isLoading: false,

      // Actions
      setCurrentWeek: (date: Date) => {
        set({ currentWeek: date }, false, 'setCurrentWeek');
      },

      setSelectedFamilyMember: (id?: string) => {
        set({ selectedFamilyMemberId: id }, false, 'setSelectedFamilyMember');
      },

      setShowQuickAdd: (show: boolean) => {
        set({ showQuickAdd: show }, false, 'setShowQuickAdd');
      },

      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'setIsLoading');
      },

      resetFilters: () => {
        set(
          { 
            selectedFamilyMemberId: undefined,
            showQuickAdd: false 
          }, 
          false, 
          'resetFilters'
        );
      },
    }),
    {
      name: 'app-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selector hooks for specific parts of the state
export const useCurrentWeek = () => useAppStore((state) => state.currentWeek);
export const useSelectedFamilyMember = () => useAppStore((state) => state.selectedFamilyMemberId);
export const useShowQuickAdd = () => useAppStore((state) => state.showQuickAdd);
export const useIsLoading = () => useAppStore((state) => state.isLoading);

// Action hooks
export const useWeekActions = () => useAppStore((state) => ({
  setCurrentWeek: state.setCurrentWeek,
}));

export const useFilterActions = () => useAppStore((state) => ({
  setSelectedFamilyMember: state.setSelectedFamilyMember,
  resetFilters: state.resetFilters,
}));

export const useUIActions = () => useAppStore((state) => ({
  setShowQuickAdd: state.setShowQuickAdd,
  setIsLoading: state.setIsLoading,
}));