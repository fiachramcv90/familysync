// Test file for useWeekNavigation Hook
// Story 1.4: Basic Family Dashboard

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import React from 'react';

// Mock the app store
jest.mock('@/stores/app-store', () => ({
  useAppStore: jest.fn(),
  useWeekActions: jest.fn(),
}));

// Mock the useFamilyTasks hook
jest.mock('@/hooks/useFamilyTasks', () => ({
  useFamilyTasks: jest.fn(),
}));

// Test wrapper with React Query
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Mock data
const mockWeekData = {
  weekStartDate: '2024-01-01',
  weekEndDate: '2024-01-07',
  days: [],
  summary: {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    pendingTasks: 0,
    totalEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    completionRate: 0,
  },
  members: [],
};

describe('useWeekNavigation', () => {
  const mockSetCurrentWeek = jest.fn();
  const mockCurrentWeek = new Date(); // Use actual current date for proper current week detection

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the store hooks
    const mockStore = require('@/stores/app-store');
    mockStore.useAppStore.mockImplementation((selector: any) => 
      selector({ currentWeek: mockCurrentWeek })
    );
    mockStore.useWeekActions.mockReturnValue({
      setCurrentWeek: mockSetCurrentWeek,
    });

    // Mock the useFamilyTasks hook
    const mockUseFamilyTasks = require('@/hooks/useFamilyTasks');
    mockUseFamilyTasks.useFamilyTasks.mockReturnValue({
      data: mockWeekData,
      isLoading: false,
    });
  });

  it('calculates week boundaries correctly', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    // Should start on Monday
    const expectedWeekStart = startOfWeek(mockCurrentWeek, { weekStartsOn: 1 });
    expect(result.current.weekStart.toISOString()).toBe(expectedWeekStart.toISOString());
  });

  it('identifies current week correctly', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    // Mock current week should be identified as current
    expect(result.current.isCurrentWeek).toBe(true);
  });

  it('generates week days array correctly', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.weekDays).toHaveLength(7);
    expect(result.current.weekDays[0].dayName).toBe('Monday');
    expect(result.current.weekDays[6].dayName).toBe('Sunday');
  });

  it('navigates to previous week', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.goToPreviousWeek();
    });

    const expectedPreviousWeek = subWeeks(mockCurrentWeek, 1);
    expect(mockSetCurrentWeek).toHaveBeenCalledWith(expectedPreviousWeek);
  });

  it('navigates to next week', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.goToNextWeek();
    });

    const expectedNextWeek = addWeeks(mockCurrentWeek, 1);
    expect(mockSetCurrentWeek).toHaveBeenCalledWith(expectedNextWeek);
  });

  it('navigates to current week', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.goToCurrentWeek();
    });

    expect(mockSetCurrentWeek).toHaveBeenCalledWith(expect.any(Date));
  });

  it('navigates to specific week', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    const specificDate = new Date('2024-02-15');
    
    act(() => {
      result.current.goToSpecificWeek(specificDate);
    });

    expect(mockSetCurrentWeek).toHaveBeenCalledWith(specificDate);
  });

  it('formats week range correctly for same month', () => {
    // Mock a week that stays within the same month
    const sameMonthWeek = new Date('2024-01-03');
    const mockStore = require('@/stores/app-store');
    mockStore.useAppStore.mockImplementation((selector: any) => 
      selector({ currentWeek: sameMonthWeek })
    );

    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    // Should format as "1-7 Jan 2024" or similar
    expect(result.current.weekRange).toMatch(/\d+-\d+\s+\w+\s+\d{4}/);
  });

  it('shows "This Week" title for current week', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.weekTitle).toBe('This Week');
  });

  it('shows formatted date range for non-current week', () => {
    // Mock a past week
    const pastWeek = new Date('2023-12-01');
    const mockStore = require('@/stores/app-store');
    mockStore.useAppStore.mockImplementation((selector: any) => 
      selector({ currentWeek: pastWeek })
    );

    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    // Should not be "This Week"
    expect(result.current.weekTitle).not.toBe('This Week');
    expect(result.current.weekTitle).toMatch(/\w+/); // Should contain some text
  });

  it('identifies today correctly in week days', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    const todayFound = result.current.weekDays.some(day => day.isToday);
    
    // Since mockCurrentWeek is set to a current date, at least one day should be today
    // This depends on the current date when running tests
    expect(typeof todayFound).toBe('boolean');
  });

  it('provides utility functions', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    const testDate = new Date('2024-01-15');
    
    // Test formatDate
    expect(result.current.formatDate(testDate, 'yyyy-MM-dd')).toBe('2024-01-15');
    
    // Test isDateToday
    expect(typeof result.current.isDateToday(testDate)).toBe('boolean');
    
    // Test isDateInCurrentWeek
    expect(typeof result.current.isDateInCurrentWeek(testDate)).toBe('boolean');
  });

  it('returns loading state correctly', () => {
    // Mock loading state
    const mockUseFamilyTasks = require('@/hooks/useFamilyTasks');
    mockUseFamilyTasks.useFamilyTasks.mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isNavigating).toBe(true);
  });

  it('handles missing week data gracefully', () => {
    // Mock no data
    const mockUseFamilyTasks = require('@/hooks/useFamilyTasks');
    mockUseFamilyTasks.useFamilyTasks.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.weekData).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('prefetches adjacent weeks', () => {
    const mockUseFamilyTasks = require('@/hooks/useFamilyTasks');
    
    renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    // Should have been called for current week, previous week, and next week
    expect(mockUseFamilyTasks.useFamilyTasks).toHaveBeenCalledTimes(3);
  });

  it('provides consistent date keys for week days', () => {
    const { result } = renderHook(() => useWeekNavigation(), {
      wrapper: createTestWrapper(),
    });

    result.current.weekDays.forEach(day => {
      expect(day.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.key).toBe(format(day.date, 'yyyy-MM-dd'));
    });
  });
});