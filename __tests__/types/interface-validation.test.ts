// TypeScript interface validation tests
// Story 1.3: Database Schema and Models

import {
  FamilyRecord,
  FamilyMemberRecord,
  TaskRecord,
  EventRecord,
  SyncLogRecord,
  FamilySettings,
  TaskStatus,
  EventStatus,
  Priority,
  Role
} from '../../src/types/database';

import {
  Family,
  Task,
  Event,
  CreateTaskInput,
  CreateEventInput,
  WeeklyDashboardData
} from '../../src/types';

import {
  validators,
  validateSchema
} from '../../src/lib/validations';

describe('TypeScript Interface Validation', () => {
  describe('Database Record Types', () => {
    it('should accept valid FamilyRecord', () => {
      const validFamily: FamilyRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Family',
        invite_code: 'ABC12345',
        settings: {
          weekStartDay: 'sunday',
          timezone: 'UTC',
          notifications: { enabled: true }
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(validFamily.id).toBeDefined();
      expect(typeof validFamily.name).toBe('string');
      expect(validFamily.settings.weekStartDay).toMatch(/^(sunday|monday)$/);
    });

    it('should accept valid FamilyMemberRecord', () => {
      const validMember: FamilyMemberRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        role: 'member',
        avatar_color: '#FF5733',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_seen_at: '2024-01-01T00:00:00Z'
      };

      expect(validMember.role).toMatch(/^(admin|member)$/);
      expect(validMember.avatar_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof validMember.is_active).toBe('boolean');
    });

    it('should accept valid TaskRecord', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const validTask: TaskRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Task',
        description: 'Test description',
        assignee_id: '123e4567-e89b-12d3-a456-426614174002',
        created_by_id: '123e4567-e89b-12d3-a456-426614174003',
        due_date: futureDate.toISOString(),
        completed_at: null,
        status: 'pending',
        category: 'task',
        priority: 'medium',
        sync_version: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(validTask.status).toMatch(/^(pending|in_progress|completed)$/);
      expect(validTask.priority).toMatch(/^(low|medium|high)$/);
      expect(validTask.category).toMatch(/^(task|event)$/);
      expect(typeof validTask.sync_version).toBe('number');
    });

    it('should accept valid EventRecord', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const validEvent: EventRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Event',
        description: 'Test description',
        assignee_id: '123e4567-e89b-12d3-a456-426614174002',
        created_by_id: '123e4567-e89b-12d3-a456-426614174003',
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        location: 'Test Location',
        status: 'scheduled',
        sync_version: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(validEvent.status).toMatch(/^(scheduled|in_progress|completed|cancelled)$/);
      expect(typeof validEvent.sync_version).toBe('number');
      expect(validEvent.start_datetime).toBeDefined();
      expect(validEvent.end_datetime).toBeDefined();
    });

    it('should accept valid SyncLogRecord', () => {
      const validSyncLog: SyncLogRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        table_name: 'tasks',
        record_id: '123e4567-e89b-12d3-a456-426614174002',
        operation: 'INSERT',
        old_data: null,
        new_data: { title: 'New Task' },
        conflict_resolved: false,
        sync_timestamp: '2024-01-01T00:00:00Z',
        created_by_id: '123e4567-e89b-12d3-a456-426614174003'
      };

      expect(validSyncLog.table_name).toMatch(/^(families|family_members|tasks|events)$/);
      expect(validSyncLog.operation).toMatch(/^(INSERT|UPDATE|DELETE)$/);
      expect(typeof validSyncLog.conflict_resolved).toBe('boolean');
    });
  });

  describe('Domain Model Types', () => {
    it('should accept valid Family domain model', () => {
      const validFamily: Family = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Family',
        inviteCode: 'ABC12345',
        settings: {
          weekStartDay: 'sunday',
          timezone: 'UTC',
          notifications: { enabled: true }
        },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        members: []
      };

      expect(validFamily.createdAt instanceof Date).toBe(true);
      expect(validFamily.updatedAt instanceof Date).toBe(true);
      expect(Array.isArray(validFamily.members)).toBe(true);
    });

    it('should accept valid Task domain model', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const validTask: Task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        familyId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Task',
        description: 'Test description',
        assigneeId: '123e4567-e89b-12d3-a456-426614174002',
        createdById: '123e4567-e89b-12d3-a456-426614174003',
        dueDate: futureDate,
        completedAt: null,
        status: 'pending',
        category: 'task',
        priority: 'medium',
        syncVersion: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      };

      expect(validTask.dueDate instanceof Date).toBe(true);
      expect(validTask.createdAt instanceof Date).toBe(true);
    });

    it('should accept valid Event domain model', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const validEvent: Event = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        familyId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Event',
        assigneeId: '123e4567-e89b-12d3-a456-426614174002',
        createdById: '123e4567-e89b-12d3-a456-426614174003',
        startDateTime: startDate,
        endDateTime: endDate,
        status: 'scheduled',
        syncVersion: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      };

      expect(validEvent.startDateTime instanceof Date).toBe(true);
      expect(validEvent.endDateTime instanceof Date).toBe(true);
    });
  });

  describe('Input Type Validation', () => {
    it('should accept valid CreateTaskInput', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const validInput: CreateTaskInput = {
        title: 'New Task',
        description: 'Task description',
        assigneeId: '123e4567-e89b-12d3-a456-426614174000',
        dueDate: futureDate,
        priority: 'high',
        category: 'task'
      };

      expect(typeof validInput.title).toBe('string');
      expect(validInput.priority).toMatch(/^(low|medium|high)$/);
    });

    it('should accept valid CreateEventInput', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const validInput: CreateEventInput = {
        title: 'New Event',
        assigneeId: '123e4567-e89b-12d3-a456-426614174000',
        startDateTime: startDate,
        endDateTime: endDate,
        location: 'Meeting Room'
      };

      expect(typeof validInput.title).toBe('string');
      expect(validInput.startDateTime instanceof Date).toBe(true);
    });
  });

  describe('Enum Type Validation', () => {
    it('should validate TaskStatus enum', () => {
      const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];
      validStatuses.forEach(status => {
        expect(['pending', 'in_progress', 'completed']).toContain(status);
      });
    });

    it('should validate EventStatus enum', () => {
      const validStatuses: EventStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];
      validStatuses.forEach(status => {
        expect(['scheduled', 'in_progress', 'completed', 'cancelled']).toContain(status);
      });
    });

    it('should validate Priority enum', () => {
      const validPriorities: Priority[] = ['low', 'medium', 'high'];
      validPriorities.forEach(priority => {
        expect(['low', 'medium', 'high']).toContain(priority);
      });
    });

    it('should validate Role enum', () => {
      const validRoles: Role[] = ['admin', 'member'];
      validRoles.forEach(role => {
        expect(['admin', 'member']).toContain(role);
      });
    });
  });

  describe('Complex Type Validation', () => {
    it('should accept valid FamilySettings', () => {
      const validSettings: FamilySettings = {
        weekStartDay: 'monday',
        timezone: 'America/New_York',
        notifications: {
          enabled: true,
          taskReminders: true,
          eventReminders: false,
          weeklyDigest: true
        }
      };

      expect(validSettings.weekStartDay).toMatch(/^(sunday|monday)$/);
      expect(typeof validSettings.notifications.enabled).toBe('boolean');
    });

    it('should accept valid WeeklyDashboardData structure', () => {
      const validDashboard: WeeklyDashboardData = {
        weekStartDate: '2024-01-01',
        weekEndDate: '2024-01-07',
        days: [
          {
            date: '2024-01-01',
            dayName: 'Monday',
            tasks: [],
            events: [],
            taskCount: 0,
            eventCount: 0,
            completedTaskCount: 0,
            overdueTaskCount: 0
          }
        ],
        summary: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          pendingTasks: 0,
          totalEvents: 0,
          completedEvents: 0,
          upcomingEvents: 0,
          completionRate: 0
        },
        members: []
      };

      expect(Array.isArray(validDashboard.days)).toBe(true);
      expect(Array.isArray(validDashboard.members)).toBe(true);
      expect(typeof validDashboard.summary.completionRate).toBe('number');
    });
  });

  describe('Zod Schema Validation', () => {
    it('should validate family insert with Zod schema', () => {
      const validData = {
        name: 'Test Family',
        invite_code: 'ABC12345',
        settings: {
          weekStartDay: 'sunday',
          timezone: 'UTC',
          notifications: { enabled: true }
        }
      };

      const result = validateSchema(validators.family.insert, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Family');
      }
    });

    it('should reject invalid family data with Zod schema', () => {
      const invalidData = {
        name: '', // Empty name should fail
        invite_code: 'invalid', // Wrong format
        settings: {
          weekStartDay: 'invalid', // Wrong enum value
          timezone: 'UTC',
          notifications: { enabled: true }
        }
      };

      const result = validateSchema(validators.family.insert, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.field.includes('name'))).toBe(true);
        expect(result.errors.some(e => e.field.includes('invite_code'))).toBe(true);
      }
    });

    it('should validate task insert with Zod schema', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      
      const validData = {
        family_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        assignee_id: '123e4567-e89b-12d3-a456-426614174001',
        created_by_id: '123e4567-e89b-12d3-a456-426614174002',
        due_date: futureDate.toISOString(),
        priority: 'high'
      };

      const result = validateSchema(validators.task.insert, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Task');
        expect(result.data.priority).toBe('high');
      }
    });

    it('should validate event insert with Zod schema', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days in the future
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // 1 hour after start
      
      const validData = {
        family_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Event',
        assignee_id: '123e4567-e89b-12d3-a456-426614174001',
        created_by_id: '123e4567-e89b-12d3-a456-426614174002',
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString()
      };

      const result = validateSchema(validators.event.insert, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Event');
      }
    });

    it('should reject event with end_datetime before start_datetime', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days in the future
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() - 1); // 1 hour before start (invalid)
      
      const invalidData = {
        family_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Event',
        assignee_id: '123e4567-e89b-12d3-a456-426614174001',
        created_by_id: '123e4567-e89b-12d3-a456-426614174002',
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString() // Before start time
      };

      const result = validateSchema(validators.event.insert, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.message.includes('after start'))).toBe(true);
      }
    });

    it('should validate API input schemas', () => {
      const createTaskInput = {
        title: 'New API Task',
        assigneeId: '123e4567-e89b-12d3-a456-426614174000',
        priority: 'medium'
      };

      const result = validateSchema(validators.api.createTask, createTaskInput);
      expect(result.success).toBe(true);
    });

    it('should validate family member filters', () => {
      const filters = {
        family_id: '123e4567-e89b-12d3-a456-426614174000',
        role: 'admin',
        is_active: true
      };

      const result = validateSchema(validators.familyMember.filters, filters);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify TaskRecord', async () => {
      const taskRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Task',
        assignee_id: '123e4567-e89b-12d3-a456-426614174002'
      };

      const { isTaskRecord } = await import('../../src/types/index');
      expect(isTaskRecord(taskRecord)).toBe(true);
      expect(isTaskRecord({ id: 'invalid' })).toBe(false);
    });

    it('should correctly identify EventRecord', async () => {
      const eventRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        start_datetime: '2024-12-31T10:00:00Z'
      };

      const { isEventRecord } = await import('../../src/types/index');
      expect(isEventRecord(eventRecord)).toBe(true);
      expect(isEventRecord({ id: 'invalid' })).toBe(false);
    });

    it('should correctly identify FamilyMemberRecord', async () => {
      const memberRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        family_id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com'
      };

      const { isFamilyMemberRecord } = await import('../../src/types/index');
      expect(isFamilyMemberRecord(memberRecord)).toBe(true);
      expect(isFamilyMemberRecord({ id: 'invalid' })).toBe(false);
    });
  });
});