// Type exports for FamilySync application
// Story 1.3: Database Schema and Models

// Database types
export * from './database';

// Family types
export * from './family';

// Task and Event types
export * from './task';

// Common utility types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  familyId: string;
  role: 'admin' | 'member';
  name: string;
  avatarColor: string;
  isActive: boolean;
  lastSeenAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  familyId: string;
}

// Configuration types
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    offlineMode: boolean;
    realTimeSync: boolean;
    pushNotifications: boolean;
  };
}

// Event emitter types for real-time updates
export interface RealTimeEvent {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'event_created' | 'event_updated' | 'event_deleted' | 'member_joined' | 'member_left';
  payload: any;
  familyId: string;
  userId?: string;
  timestamp: Date;
}

// Service worker and offline types
export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'tasks' | 'events' | 'family_members';
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: Date | null;
  pendingActions: number;
  syncInProgress: boolean;
  conflictsCount: number;
}

// Form types for components
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'time' | 'datetime-local' | 'select' | 'textarea' | 'checkbox';
  value: T;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: any; // React.ReactNode equivalent
  testId?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: any;
}

// Date and time utility types
export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:mm format
export type DateTimeString = string; // ISO 8601 datetime format

// Color and theme types
export type AvatarColor = string; // hex color code
export type ThemeMode = 'light' | 'dark' | 'system';

// Export type guards and utilities
export const isTaskRecord = (obj: any): obj is import('./database').TaskRecord => {
  return obj && typeof obj.id === 'string' && typeof obj.family_id === 'string' && typeof obj.title === 'string';
};

export const isEventRecord = (obj: any): obj is import('./database').EventRecord => {
  return obj && typeof obj.id === 'string' && typeof obj.family_id === 'string' && typeof obj.start_datetime === 'string';
};

export const isFamilyMemberRecord = (obj: any): obj is import('./database').FamilyMemberRecord => {
  return obj && typeof obj.id === 'string' && typeof obj.family_id === 'string' && typeof obj.email === 'string';
};

// Re-export specific types for convenience
export type { 
  // Database types
  FamilyRecord,
  FamilyMemberRecord, 
  TaskRecord,
  EventRecord,
  SyncLogRecord,
  FamilySettings,
  
  // Status enums
  TaskStatus,
  EventStatus,
  Priority,
  Role,
  
  // Database Input types (keep original names to avoid confusion)
  TaskInsert,
  TaskUpdate,
  EventInsert,
  EventUpdate,
  FamilyInsert as CreateFamilyInput,
  FamilyUpdate as UpdateFamilyInput
} from './database';

// Re-export domain types from family.ts
export type { 
  Family,
  FamilyMember
} from './family';

// Re-export domain types from task.ts
export type { 
  Task,
  Event,
  CreateTaskInput,
  UpdateTaskInput,
  CreateEventInput,
  UpdateEventInput,
  WeeklyTaskView,
  WeeklyDashboardData
} from './task';