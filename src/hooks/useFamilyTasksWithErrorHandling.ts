// Enhanced hook for family tasks with comprehensive error handling
// Story S1.2: Replace Mock Data with Real Supabase Integration

import { useFamilyTasks, useFamilyMembers } from './useFamilyTasks';
import { useAuthenticatedUser } from './useAuthenticatedUser';

export interface FamilyTasksState {
  weeklyData: any;
  familyMembers: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasFamily: boolean;
  isEmpty: boolean;
  error: string | null;
  authError: string | null;
  dataError: string | null;
}

/**
 * Enhanced hook that provides comprehensive error handling and empty state management
 * for family tasks and members data.
 * 
 * This hook handles:
 * - Authentication errors
 * - Family context missing
 * - Database connection failures
 * - Empty family data (new families)
 * - Loading states
 */
export const useFamilyTasksWithErrorHandling = (weekStart: Date): FamilyTasksState => {
  const authContext = useAuthenticatedUser();
  const tasksQuery = useFamilyTasks(weekStart);
  const membersQuery = useFamilyMembers();

  // Authentication and family context validation
  if (authContext.isLoading) {
    return {
      weeklyData: null,
      familyMembers: null,
      isLoading: true,
      isAuthenticated: false,
      hasFamily: false,
      isEmpty: false,
      error: null,
      authError: null,
      dataError: null,
    };
  }

  if (!authContext.isAuthenticated) {
    return {
      weeklyData: null,
      familyMembers: null,
      isLoading: false,
      isAuthenticated: false,
      hasFamily: false,
      isEmpty: false,
      error: 'Authentication required to view family data',
      authError: 'Please log in to continue',
      dataError: null,
    };
  }

  if (authContext.error || !authContext.familyId) {
    return {
      weeklyData: null,
      familyMembers: null,
      isLoading: false,
      isAuthenticated: true,
      hasFamily: false,
      isEmpty: false,
      error: authContext.error || 'No family assigned',
      authError: authContext.error || 'You are not part of any family yet. Please join or create a family.',
      dataError: null,
    };
  }

  // Data loading states
  const isDataLoading = tasksQuery.isLoading || membersQuery.isLoading;
  
  if (isDataLoading) {
    return {
      weeklyData: null,
      familyMembers: null,
      isLoading: true,
      isAuthenticated: true,
      hasFamily: true,
      isEmpty: false,
      error: null,
      authError: null,
      dataError: null,
    };
  }

  // Handle data errors
  const tasksError = tasksQuery.error as Error | null;
  const membersError = membersQuery.error as Error | null;
  
  if (tasksError || membersError) {
    const errorMessage = tasksError?.message || membersError?.message || 'Failed to load family data';
    
    return {
      weeklyData: tasksQuery.data || null,
      familyMembers: membersQuery.data || null,
      isLoading: false,
      isAuthenticated: true,
      hasFamily: true,
      isEmpty: false,
      error: errorMessage,
      authError: null,
      dataError: `Database error: ${errorMessage}. Please try refreshing the page.`,
    };
  }

  // Check for empty family data (new families)
  const hasNoMembers = !membersQuery.data || membersQuery.data.length === 0;
  const hasNoTasks = !tasksQuery.data || 
    (tasksQuery.data.summary?.totalTasks === 0 && tasksQuery.data.summary?.totalEvents === 0);

  const isEmpty = hasNoMembers || hasNoTasks;

  // Success case
  return {
    weeklyData: tasksQuery.data,
    familyMembers: membersQuery.data,
    isLoading: false,
    isAuthenticated: true,
    hasFamily: true,
    isEmpty,
    error: null,
    authError: null,
    dataError: null,
  };
};

/**
 * Hook specifically for handling empty family states
 * Provides guidance messages for new families
 */
export const useEmptyFamilyGuidance = (isEmpty: boolean, hasFamily: boolean) => {
  if (!hasFamily) {
    return {
      title: 'No Family Assigned',
      message: 'You need to join or create a family to start managing tasks together.',
      actionText: 'Create or Join Family',
      actionPath: '/family/setup',
    };
  }

  if (isEmpty) {
    return {
      title: 'Welcome to Your Family Dashboard!',
      message: 'Get started by adding family members and creating your first tasks.',
      actionText: 'Add First Task',
      actionPath: '/tasks/create',
    };
  }

  return null;
};