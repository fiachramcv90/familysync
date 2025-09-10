// Hook for authenticated user and family context
// Story S1.2: Replace Mock Data with Real Supabase Integration

import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/auth';

export interface AuthenticatedUserContext {
  user: UserProfile | null;
  familyId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get the current authenticated user and their family context
 * 
 * This hook ensures that all data operations are performed with the correct
 * family_id filtering for Row Level Security compliance.
 * 
 * @returns AuthenticatedUserContext with user profile and family information
 */
export const useAuthenticatedUser = (): AuthenticatedUserContext => {
  const { user, profile, loading } = useAuth();

  // If still loading auth state
  if (loading) {
    return {
      user: null,
      familyId: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
  }

  // If no authenticated user
  if (!user) {
    return {
      user: null,
      familyId: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'User not authenticated',
    };
  }

  // If user is authenticated but profile not loaded
  if (!profile) {
    return {
      user: null,
      familyId: null,
      isAuthenticated: true,
      isLoading: false,
      error: 'User profile not found',
    };
  }

  // If user doesn't have a family assignment
  if (!profile.family_id) {
    return {
      user: profile,
      familyId: null,
      isAuthenticated: true,
      isLoading: false,
      error: 'User not assigned to any family',
    };
  }

  // Success case - user is authenticated with family context
  return {
    user: profile,
    familyId: profile.family_id,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };
};

/**
 * Utility function to ensure family context is available
 * Throws an error if user is not authenticated or lacks family context
 * 
 * @returns familyId that can be safely used in database queries
 */
export const requireFamilyContext = (): string => {
  const { familyId, isAuthenticated, error } = useAuthenticatedUser();

  if (!isAuthenticated) {
    throw new Error('Authentication required');
  }

  if (error) {
    throw new Error(error);
  }

  if (!familyId) {
    throw new Error('Family context required');
  }

  return familyId;
};

/**
 * Utility function to get current user ID for database operations
 * 
 * @returns userId that can be used for created_by fields
 */
export const requireUserId = (): string => {
  const { user, isAuthenticated, error } = useAuthenticatedUser();

  if (!isAuthenticated) {
    throw new Error('Authentication required');
  }

  if (error) {
    throw new Error(error);
  }

  if (!user) {
    throw new Error('User context required');
  }

  return user.id;
};