// Task and Event types for FamilySync application
// Story 1.3: Database Schema and Models

import { TaskRecord, EventRecord, Priority, TaskStatus, EventStatus } from './database';
import { FamilyMember } from './family';

// Re-export types that are commonly used by components
export type { Priority, TaskStatus, EventStatus } from './database';

// Domain model interfaces for tasks
export interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string | null;
  assigneeId: string;
  createdById: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  status: TaskStatus;
  category: 'task' | 'event';
  priority: Priority;
  syncVersion: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated relationships
  assignee?: FamilyMember;
  createdBy?: FamilyMember;
}

// Domain model interfaces for events
export interface Event {
  id: string;
  familyId: string;
  title: string;
  description?: string | null;
  assigneeId: string;
  createdById: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string | null;
  status: EventStatus;
  syncVersion: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated relationships
  assignee?: FamilyMember;
  createdBy?: FamilyMember;
  
  // Computed properties
  duration?: number; // in minutes
  isAllDay?: boolean;
  isRecurring?: boolean;
}

// Task creation and update interfaces
export interface CreateTaskInput {
  title: string;
  description?: string;
  assigneeId: string;
  dueDate?: Date | string;
  priority?: Priority;
  category?: 'task' | 'event';
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date | string | null;
  status?: TaskStatus;
  priority?: Priority;
  category?: 'task' | 'event';
}

// Event creation and update interfaces
export interface CreateEventInput {
  title: string;
  description?: string;
  assigneeId: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  location?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  startDateTime?: Date | string;
  endDateTime?: Date | string;
  location?: string;
  status?: EventStatus;
}

// Task and event filtering
export interface TaskFilterOptions {
  status?: TaskStatus | TaskStatus[];
  assigneeId?: string | string[];
  createdById?: string;
  priority?: Priority | Priority[];
  dueDateFrom?: Date | string;
  dueDateTo?: Date | string;
  category?: 'task' | 'event';
  searchTerm?: string;
  includeCompleted?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface EventFilterOptions {
  status?: EventStatus | EventStatus[];
  assigneeId?: string | string[];
  createdById?: string;
  startDateFrom?: Date | string;
  startDateTo?: Date | string;
  location?: string;
  searchTerm?: string;
  includeCompleted?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'startDateTime' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Weekly dashboard specific types
export interface WeeklyTaskView {
  date: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  tasks: Task[];
  events: Event[];
  taskCount: number;
  eventCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
}

export interface WeeklyDashboardData {
  weekStartDate: string;
  weekEndDate: string;
  days: WeeklyTaskView[];
  summary: WeekSummary;
  members: FamilyMemberWeeklyStats[];
}

export interface WeekSummary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  completionRate: number;
}

export interface FamilyMemberWeeklyStats {
  memberId: string;
  memberName: string;
  avatarColor: string;
  tasksAssigned: number;
  tasksCompleted: number;
  eventsAssigned: number;
  eventsCompleted: number;
  completionRate: number;
  overdueCount: number;
}

// Task and event templates
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  priority: Priority;
  estimatedDuration?: number; // in minutes
  category: 'task' | 'event';
  tags: string[];
  isActive: boolean;
}

// Recurring task configuration
export interface RecurringTaskConfig {
  taskId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  maxOccurrences?: number;
  isActive: boolean;
}

// Task comments and history
export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author?: FamilyMember;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  changeType: 'created' | 'updated' | 'completed' | 'reopened' | 'deleted' | 'assigned';
  previousValue?: any;
  newValue?: any;
  changedById: string;
  changeDescription: string;
  createdAt: Date;
  changedBy?: FamilyMember;
}

// Offline sync and conflict resolution
export interface TaskSyncData {
  id: string;
  syncVersion: number;
  lastSyncAt: Date;
  localChanges: boolean;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface TaskConflict {
  taskId: string;
  localVersion: Task;
  remoteVersion: Task;
  conflictFields: string[];
  resolutionRequired: boolean;
  createdAt: Date;
}

// Error types for task operations
export interface TaskError {
  code: 'TASK_NOT_FOUND' | 'INVALID_ASSIGNEE' | 'INVALID_DATE' | 'SYNC_CONFLICT' | 'PERMISSION_DENIED';
  message: string;
  field?: string;
  taskId?: string;
}

// Utility type conversions
export type TaskFromDatabase = (record: TaskRecord) => Task;
export type TaskToDatabase = (task: Task) => Partial<TaskRecord>;
export type EventFromDatabase = (record: EventRecord) => Event;
export type EventToDatabase = (event: Event) => Partial<EventRecord>;

// Task and event query options
export interface TaskQueryOptions {
  includeAssignee?: boolean;
  includeCreatedBy?: boolean;
  includeComments?: boolean;
  includeHistory?: boolean;
}

export interface EventQueryOptions {
  includeAssignee?: boolean;
  includeCreatedBy?: boolean;
  includeConflicts?: boolean;
}