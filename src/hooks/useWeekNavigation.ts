// Week Navigation Hook
// Story 1.4: Basic Family Dashboard

import { useCallback, useMemo } from 'react';
import { 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  format, 
  isToday,
  isSameWeek,
} from 'date-fns';
import { useAppStore, useWeekActions } from '@/stores/app-store';
import { useFamilyTasks } from './useFamilyTasks';

export const useWeekNavigation = () => {
  const currentWeek = useAppStore((state) => state.currentWeek);
  const { setCurrentWeek } = useWeekActions();

  // Calculate week boundaries (Monday start)
  const weekStart = useMemo(() => 
    startOfWeek(currentWeek, { weekStartsOn: 1 }), 
    [currentWeek]
  );
  
  const weekEnd = useMemo(() => 
    endOfWeek(currentWeek, { weekStartsOn: 1 }), 
    [currentWeek]
  );

  // Check if current week is this week
  const isCurrentWeek = useMemo(() => 
    isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 }),
    [currentWeek]
  );

  // Navigation functions
  const goToPreviousWeek = useCallback(() => {
    const previousWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(previousWeek);
  }, [currentWeek, setCurrentWeek]);

  const goToNextWeek = useCallback(() => {
    const nextWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(nextWeek);
  }, [currentWeek, setCurrentWeek]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date());
  }, [setCurrentWeek]);

  const goToSpecificWeek = useCallback((date: Date) => {
    setCurrentWeek(date);
  }, [setCurrentWeek]);

  // Week display formatting
  const weekRange = useMemo(() => {
    const startFormatted = format(weekStart, 'MMM d');
    const endFormatted = format(weekEnd, 'MMM d, yyyy');
    
    // If both dates are in the same month and year
    if (format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy')) {
      return `${format(weekStart, 'd')}-${format(weekEnd, 'd MMM yyyy')}`;
    }
    
    // If dates span different months but same year
    if (format(weekStart, 'yyyy') === format(weekEnd, 'yyyy')) {
      return `${startFormatted} - ${endFormatted}`;
    }
    
    // If dates span different years
    return `${format(weekStart, 'MMM d, yyyy')} - ${endFormatted}`;
  }, [weekStart, weekEnd]);

  const weekTitle = useMemo(() => {
    if (isCurrentWeek) {
      return 'This Week';
    }
    return weekRange;
  }, [isCurrentWeek, weekRange]);

  // Week days array for calendar display
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      days.push({
        date,
        dayName: format(date, 'EEEE'),
        dayShort: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        monthShort: format(date, 'MMM'),
        isToday: isToday(date),
        key: format(date, 'yyyy-MM-dd'),
      });
    }
    return days;
  }, [weekStart]);

  // Prefetch adjacent weeks for smooth navigation
  const { data: currentWeekData, isLoading: isCurrentWeekLoading } = useFamilyTasks(currentWeek);
  const { data: previousWeekData } = useFamilyTasks(subWeeks(currentWeek, 1));
  const { data: nextWeekData } = useFamilyTasks(addWeeks(currentWeek, 1));

  // Loading state for week transitions
  const isNavigating = isCurrentWeekLoading;

  return {
    // Current week data
    currentWeek,
    weekStart,
    weekEnd,
    isCurrentWeek,
    weekRange,
    weekTitle,
    weekDays,
    
    // Navigation functions
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToSpecificWeek,
    
    // Data and loading states
    weekData: currentWeekData,
    isNavigating,
    isLoading: isCurrentWeekLoading,
    
    // Prefetched data
    previousWeekData,
    nextWeekData,
    
    // Utility functions
    formatDate: (date: Date, formatStr: string) => format(date, formatStr),
    isDateToday: (date: Date) => isToday(date),
    isDateInCurrentWeek: (date: Date) => isSameWeek(date, currentWeek, { weekStartsOn: 1 }),
  };
};