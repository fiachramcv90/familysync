// Database table types for FamilySync application
// Story 1.3: Database Schema and Models

// Base database record with common fields
export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

// Family settings configuration
export interface FamilySettings {
  weekStartDay: 'sunday' | 'monday';
  timezone: string;
  notifications: {
    enabled: boolean;
    taskReminders?: boolean;
    eventReminders?: boolean;
    weeklyDigest?: boolean;
  };
}

// Database table interfaces (exact match to schema)
export interface FamilyRecord extends BaseRecord {
  name: string;
  invite_code: string;
  settings: FamilySettings;
}

export interface FamilyMemberRecord extends BaseRecord {
  family_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'member';
  avatar_color: string;
  is_active: boolean;
  last_seen_at: string;
}

export interface TaskRecord extends BaseRecord {
  family_id: string;
  title: string;
  description: string | null;
  assignee_id: string;
  created_by_id: string;
  due_date: string | null;
  completed_at: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'task' | 'event';
  priority: 'low' | 'medium' | 'high';
  sync_version: number;
}

export interface EventRecord extends BaseRecord {
  family_id: string;
  title: string;
  description: string | null;
  assignee_id: string;
  created_by_id: string;
  start_datetime: string;
  end_datetime: string;
  location: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sync_version: number;
}

export interface SyncLogRecord {
  id: string;
  family_id: string;
  table_name: 'families' | 'family_members' | 'tasks' | 'events';
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  conflict_resolved: boolean;
  sync_timestamp: string;
  created_by_id: string | null;
}

// Input types for database operations (without system-generated fields)
export interface FamilyInsert {
  id?: string;
  name: string;
  invite_code: string;
  settings?: FamilySettings;
}

export interface FamilyUpdate {
  name?: string;
  invite_code?: string;
  settings?: FamilySettings;
}

export interface FamilyMemberInsert {
  id?: string;
  family_id: string;
  email: string;
  password_hash: string;
  name: string;
  role?: 'admin' | 'member';
  avatar_color: string;
  is_active?: boolean;
}

export interface FamilyMemberUpdate {
  email?: string;
  password_hash?: string;
  name?: string;
  role?: 'admin' | 'member';
  avatar_color?: string;
  is_active?: boolean;
  last_seen_at?: string;
}

export interface TaskInsert {
  id?: string;
  family_id: string;
  title: string;
  description?: string | null;
  assignee_id: string;
  created_by_id: string;
  due_date?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  category?: 'task' | 'event';
  priority?: 'low' | 'medium' | 'high';
  sync_version?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  assignee_id?: string;
  due_date?: string | null;
  completed_at?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  category?: 'task' | 'event';
  priority?: 'low' | 'medium' | 'high';
}

export interface EventInsert {
  id?: string;
  family_id: string;
  title: string;
  description?: string | null;
  assignee_id: string;
  created_by_id: string;
  start_datetime: string;
  end_datetime: string;
  location?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sync_version?: number;
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  assignee_id?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface SyncLogInsert {
  id?: string;
  family_id: string;
  table_name: 'families' | 'family_members' | 'tasks' | 'events';
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  conflict_resolved?: boolean;
  sync_timestamp?: string;
  created_by_id?: string | null;
}

// Type unions for common usage
export type DatabaseRecord = FamilyRecord | FamilyMemberRecord | TaskRecord | EventRecord | SyncLogRecord;
export type TableName = 'families' | 'family_members' | 'tasks' | 'events' | 'sync_logs';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';
export type Role = 'admin' | 'member';
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

// Query filter types for common operations
export interface FamilyFilters {
  id?: string;
  invite_code?: string;
}

export interface TaskFilters {
  family_id?: string;
  assignee_id?: string;
  created_by_id?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  due_date_from?: string;
  due_date_to?: string;
  category?: 'task' | 'event';
}

export interface EventFilters {
  family_id?: string;
  assignee_id?: string;
  created_by_id?: string;
  status?: EventStatus | EventStatus[];
  start_date_from?: string;
  start_date_to?: string;
  location?: string;
}

export interface FamilyMemberFilters {
  family_id?: string;
  role?: Role;
  is_active?: boolean;
  email?: string;
}