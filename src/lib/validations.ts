// Data validation schemas using Zod for FamilySync application
// Story 1.3: Database Schema and Models

import { z } from 'zod';

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const colorHexSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');
export const inviteCodeSchema = z.string().regex(/^[A-Z0-9]{8}$/, 'Invite code must be 8 uppercase alphanumeric characters');

// Date validation helpers
export const futureDateSchema = z.union([
  z.string().datetime(),
  z.date()
]).refine((date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}, 'Date must be in the future');

export const pastOrPresentDateSchema = z.union([
  z.string().datetime(),
  z.date()
]).refine((date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d <= new Date();
}, 'Date cannot be in the future');

// Family Settings validation
export const familySettingsSchema = z.object({
  weekStartDay: z.enum(['sunday', 'monday'], {
    errorMap: () => ({ message: 'Week start day must be either sunday or monday' })
  }),
  timezone: z.string().min(1, 'Timezone is required'),
  notifications: z.object({
    enabled: z.boolean(),
    taskReminders: z.boolean().optional(),
    eventReminders: z.boolean().optional(),
    weeklyDigest: z.boolean().optional()
  })
});

// Family validation schemas
export const familyInsertSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string()
    .min(1, 'Family name is required')
    .max(100, 'Family name must be less than 100 characters')
    .trim(),
  invite_code: inviteCodeSchema,
  settings: familySettingsSchema.optional().default({
    weekStartDay: 'sunday',
    timezone: 'UTC',
    notifications: { enabled: true }
  })
});

export const familyUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Family name is required')
    .max(100, 'Family name must be less than 100 characters')
    .trim()
    .optional(),
  invite_code: inviteCodeSchema.optional(),
  settings: familySettingsSchema.optional()
});

// Family Member validation schemas
export const familyMemberInsertSchema = z.object({
  id: uuidSchema.optional(),
  family_id: uuidSchema,
  email: emailSchema,
  password_hash: z.string().min(1, 'Password hash is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  role: z.enum(['admin', 'member']).default('member'),
  avatar_color: colorHexSchema,
  is_active: z.boolean().default(true)
});

export const familyMemberUpdateSchema = z.object({
  email: emailSchema.optional(),
  password_hash: z.string().min(1, 'Password hash is required').optional(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  role: z.enum(['admin', 'member']).optional(),
  avatar_color: colorHexSchema.optional(),
  is_active: z.boolean().optional(),
  last_seen_at: z.string().datetime().optional()
});

// Task validation schemas
export const taskInsertSchema = z.object({
  id: uuidSchema.optional(),
  family_id: uuidSchema,
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  assignee_id: uuidSchema,
  created_by_id: uuidSchema,
  due_date: z.string().datetime().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  category: z.enum(['task', 'event']).default('task'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  sync_version: z.number().int().positive().default(1)
}).refine((data) => {
  // If due_date is provided, it should be in the future relative to creation
  if (data.due_date) {
    const dueDate = new Date(data.due_date);
    return dueDate > new Date();
  }
  return true;
}, {
  message: 'Due date must be in the future',
  path: ['due_date']
});

export const taskUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be less than 200 characters')
    .trim()
    .optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  assignee_id: uuidSchema.optional(),
  due_date: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  category: z.enum(['task', 'event']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
}).refine((data) => {
  // Completion logic validation
  if (data.status === 'completed' && !data.completed_at) {
    return false;
  }
  if (data.status !== 'completed' && data.completed_at) {
    return false;
  }
  return true;
}, {
  message: 'Completed tasks must have completed_at timestamp',
  path: ['completed_at']
});

// Event validation schemas
export const eventInsertSchema = z.object({
  id: uuidSchema.optional(),
  family_id: uuidSchema,
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title must be less than 200 characters')
    .trim(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  assignee_id: uuidSchema,
  created_by_id: uuidSchema,
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  location: z.string().max(200, 'Location must be less than 200 characters').nullable().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  sync_version: z.number().int().positive().default(1)
}).refine((data) => {
  // End datetime must be after start datetime
  const startDate = new Date(data.start_datetime);
  const endDate = new Date(data.end_datetime);
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_datetime']
}).refine((data) => {
  // Start datetime should be in the future (for new events)
  const startDate = new Date(data.start_datetime);
  return startDate > new Date();
}, {
  message: 'Event start time must be in the future',
  path: ['start_datetime']
});

export const eventUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title must be less than 200 characters')
    .trim()
    .optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable().optional(),
  assignee_id: uuidSchema.optional(),
  start_datetime: z.string().datetime().optional(),
  end_datetime: z.string().datetime().optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').nullable().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional()
}).refine((data) => {
  // If both dates are provided, end must be after start
  if (data.start_datetime && data.end_datetime) {
    const startDate = new Date(data.start_datetime);
    const endDate = new Date(data.end_datetime);
    return endDate > startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_datetime']
});

// Sync Log validation schema
export const syncLogInsertSchema = z.object({
  id: uuidSchema.optional(),
  family_id: uuidSchema,
  table_name: z.enum(['families', 'family_members', 'tasks', 'events']),
  record_id: uuidSchema,
  operation: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  old_data: z.record(z.any()).nullable().optional(),
  new_data: z.record(z.any()).nullable().optional(),
  conflict_resolved: z.boolean().default(false),
  sync_timestamp: z.string().datetime().optional(),
  created_by_id: uuidSchema.nullable().optional()
}).refine((data) => {
  // Operation data logic validation
  if (data.operation === 'INSERT') {
    return data.old_data === null && data.new_data !== null;
  }
  if (data.operation === 'UPDATE') {
    return data.old_data !== null && data.new_data !== null;
  }
  if (data.operation === 'DELETE') {
    return data.old_data !== null && data.new_data === null;
  }
  return false;
}, {
  message: 'Invalid data configuration for operation type',
  path: ['operation']
});

// Query filter validation schemas
export const taskFiltersSchema = z.object({
  family_id: uuidSchema.optional(),
  assignee_id: z.union([uuidSchema, z.array(uuidSchema)]).optional(),
  created_by_id: uuidSchema.optional(),
  status: z.union([
    z.enum(['pending', 'in_progress', 'completed']),
    z.array(z.enum(['pending', 'in_progress', 'completed']))
  ]).optional(),
  priority: z.union([
    z.enum(['low', 'medium', 'high']),
    z.array(z.enum(['low', 'medium', 'high']))
  ]).optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  category: z.enum(['task', 'event']).optional()
});

export const eventFiltersSchema = z.object({
  family_id: uuidSchema.optional(),
  assignee_id: z.union([uuidSchema, z.array(uuidSchema)]).optional(),
  created_by_id: uuidSchema.optional(),
  status: z.union([
    z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
    z.array(z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']))
  ]).optional(),
  start_date_from: z.string().datetime().optional(),
  start_date_to: z.string().datetime().optional(),
  location: z.string().optional()
});

export const familyMemberFiltersSchema = z.object({
  family_id: uuidSchema.optional(),
  role: z.enum(['admin', 'member']).optional(),
  is_active: z.boolean().optional(),
  email: emailSchema.optional()
});

// API input validation for common operations
export const createFamilyInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  creatorEmail: emailSchema,
  creatorName: z.string().min(1).max(100).trim(),
  creatorPassword: z.string().min(6, 'Password must be at least 6 characters'),
  settings: familySettingsSchema.optional()
});

export const joinFamilyInputSchema = z.object({
  inviteCode: inviteCodeSchema,
  email: emailSchema,
  name: z.string().min(1).max(100).trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatarColor: colorHexSchema.optional()
});

export const createTaskInputSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  assigneeId: uuidSchema,
  dueDate: z.union([z.string().datetime(), z.date()]).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['task', 'event']).default('task')
});

export const createEventInputSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  assigneeId: uuidSchema,
  startDateTime: z.union([z.string().datetime(), z.date()]),
  endDateTime: z.union([z.string().datetime(), z.date()]),
  location: z.string().max(200).optional()
}).refine((data) => {
  const start = typeof data.startDateTime === 'string' ? new Date(data.startDateTime) : data.startDateTime;
  const end = typeof data.endDateTime === 'string' ? new Date(data.endDateTime) : data.endDateTime;
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDateTime']
});

// Validation error handling utilities
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
};

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }]
    };
  }
}

// Export commonly used validators
export const validators = {
  family: {
    insert: familyInsertSchema,
    update: familyUpdateSchema
  },
  familyMember: {
    insert: familyMemberInsertSchema,
    update: familyMemberUpdateSchema,
    filters: familyMemberFiltersSchema
  },
  task: {
    insert: taskInsertSchema,
    update: taskUpdateSchema,
    filters: taskFiltersSchema
  },
  event: {
    insert: eventInsertSchema,
    update: eventUpdateSchema,
    filters: eventFiltersSchema
  },
  syncLog: {
    insert: syncLogInsertSchema
  },
  api: {
    createFamily: createFamilyInputSchema,
    joinFamily: joinFamilyInputSchema,
    createTask: createTaskInputSchema,
    createEvent: createEventInputSchema
  }
};