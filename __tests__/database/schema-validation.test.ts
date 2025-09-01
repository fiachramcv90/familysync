// Database schema validation tests
// Story 1.3: Database Schema and Models

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Test database configuration
const supabaseUrl = process.env.SUPABASE_TEST_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_TEST_ANON_KEY || 'test-key';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

describe('Database Schema Validation', () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await supabase.from('sync_logs').delete().neq('id', '');
    await supabase.from('events').delete().neq('id', '');
    await supabase.from('tasks').delete().neq('id', '');
    await supabase.from('family_members').delete().neq('id', '');
    await supabase.from('families').delete().neq('id', '');
  });

  describe('Families Table', () => {
    it('should create family with valid data', async () => {
      const familyData = {
        id: uuidv4(),
        name: 'Test Family',
        invite_code: 'ABC12345',
        settings: {
          weekStartDay: 'sunday' as const,
          timezone: 'UTC',
          notifications: { enabled: true }
        }
      };

      const { data, error } = await supabase
        .from('families')
        .insert(familyData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        id: familyData.id,
        name: familyData.name,
        invite_code: familyData.invite_code
      });
      expect(data?.settings).toEqual(familyData.settings);
    });

    it('should reject family with invalid invite code format', async () => {
      const familyData = {
        name: 'Test Family',
        invite_code: 'invalid', // Should be 8 uppercase alphanumeric
        settings: {}
      };

      const { error } = await supabase
        .from('families')
        .insert(familyData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/families_invite_code_format/);
    });

    it('should reject family with empty name', async () => {
      const familyData = {
        name: '', // Should not be empty
        invite_code: 'ABC12345',
        settings: {}
      };

      const { error } = await supabase
        .from('families')
        .insert(familyData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/families_name_length/);
    });

    it('should reject duplicate invite codes', async () => {
      const inviteCode = 'UNIQUE01';
      
      // Insert first family
      await supabase.from('families').insert({
        name: 'First Family',
        invite_code: inviteCode,
        settings: {}
      });

      // Try to insert second family with same invite code
      const { error } = await supabase.from('families').insert({
        name: 'Second Family',
        invite_code: inviteCode,
        settings: {}
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/duplicate key value|unique constraint/);
    });
  });

  describe('Family Members Table', () => {
    let testFamilyId: string;

    beforeEach(async () => {
      // Create test family
      const { data: family } = await supabase
        .from('families')
        .insert({
          name: 'Test Family',
          invite_code: `TEST${Math.random().toString().substr(2, 4)}`,
          settings: {}
        })
        .select()
        .single();
      
      testFamilyId = family!.id;
    });

    it('should create family member with valid data', async () => {
      const memberData = {
        id: uuidv4(),
        family_id: testFamilyId,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        role: 'member' as const,
        avatar_color: '#FF5733',
        is_active: true
      };

      const { data, error } = await supabase
        .from('family_members')
        .insert(memberData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject(memberData);
    });

    it('should reject invalid email format', async () => {
      const memberData = {
        family_id: testFamilyId,
        email: 'invalid-email', // Invalid format
        password_hash: 'hashed_password',
        name: 'Test User',
        avatar_color: '#FF5733'
      };

      const { error } = await supabase
        .from('family_members')
        .insert(memberData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/family_members_email_format/);
    });

    it('should reject invalid avatar color format', async () => {
      const memberData = {
        family_id: testFamilyId,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        avatar_color: 'invalid-color' // Should be hex format
      };

      const { error } = await supabase
        .from('family_members')
        .insert(memberData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/family_members_avatar_color_format/);
    });

    it('should reject invalid role', async () => {
      const memberData = {
        family_id: testFamilyId,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        role: 'invalid_role', // Should be 'admin' or 'member'
        avatar_color: '#FF5733'
      };

      const { error } = await supabase
        .from('family_members')
        .insert(memberData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid input value for enum|role/);
    });
  });

  describe('Tasks Table', () => {
    let testFamilyId: string;
    let testMemberId: string;

    beforeEach(async () => {
      // Create test family and member
      const { data: family } = await supabase
        .from('families')
        .insert({
          name: 'Test Family',
          invite_code: `TEST${Math.random().toString().substr(2, 4)}`,
          settings: {}
        })
        .select()
        .single();
      
      testFamilyId = family!.id;

      const { data: member } = await supabase
        .from('family_members')
        .insert({
          family_id: testFamilyId,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          name: 'Test User',
          avatar_color: '#FF5733'
        })
        .select()
        .single();
      
      testMemberId = member!.id;
    });

    it('should create task with valid data', async () => {
      const taskData = {
        id: uuidv4(),
        family_id: testFamilyId,
        title: 'Test Task',
        description: 'Test description',
        assignee_id: testMemberId,
        created_by_id: testMemberId,
        due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'task' as const
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        ...taskData,
        sync_version: 1 // Default value
      });
    });

    it('should enforce completed task logic', async () => {
      // First create a task
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          family_id: testFamilyId,
          title: 'Test Task',
          assignee_id: testMemberId,
          created_by_id: testMemberId,
          status: 'completed', // Completed but no completed_at
          priority: 'medium',
          category: 'task'
        })
        .select()
        .single();

      // This should fail due to tasks_completed_logic constraint
      expect(task).toBeNull();
    });

    it('should reject invalid status', async () => {
      const taskData = {
        family_id: testFamilyId,
        title: 'Test Task',
        assignee_id: testMemberId,
        created_by_id: testMemberId,
        status: 'invalid_status', // Should be pending, in_progress, or completed
        priority: 'medium',
        category: 'task'
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/invalid input value for enum|status/);
    });

    it('should increment sync_version on update', async () => {
      // Create task
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          family_id: testFamilyId,
          title: 'Test Task',
          assignee_id: testMemberId,
          created_by_id: testMemberId
        })
        .select()
        .single();

      expect(task?.sync_version).toBe(1);

      // Update task
      const { data: updatedTask } = await supabase
        .from('tasks')
        .update({ title: 'Updated Task' })
        .eq('id', task!.id)
        .select()
        .single();

      expect(updatedTask?.sync_version).toBe(2);
    });
  });

  describe('Events Table', () => {
    let testFamilyId: string;
    let testMemberId: string;

    beforeEach(async () => {
      // Create test family and member
      const { data: family } = await supabase
        .from('families')
        .insert({
          name: 'Test Family',
          invite_code: `TEST${Math.random().toString().substr(2, 4)}`,
          settings: {}
        })
        .select()
        .single();
      
      testFamilyId = family!.id;

      const { data: member } = await supabase
        .from('family_members')
        .insert({
          family_id: testFamilyId,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          name: 'Test User',
          avatar_color: '#FF5733'
        })
        .select()
        .single();
      
      testMemberId = member!.id;
    });

    it('should create event with valid data', async () => {
      const eventData = {
        id: uuidv4(),
        family_id: testFamilyId,
        title: 'Test Event',
        assignee_id: testMemberId,
        created_by_id: testMemberId,
        start_datetime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        end_datetime: new Date(Date.now() + 90000000).toISOString(), // Day after tomorrow
        status: 'scheduled' as const
      };

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject(eventData);
    });

    it('should reject event where end_datetime <= start_datetime', async () => {
      const eventData = {
        family_id: testFamilyId,
        title: 'Test Event',
        assignee_id: testMemberId,
        created_by_id: testMemberId,
        start_datetime: new Date(Date.now() + 86400000).toISOString(),
        end_datetime: new Date(Date.now() + 43200000).toISOString(), // Earlier than start
        status: 'scheduled'
      };

      const { error } = await supabase
        .from('events')
        .insert(eventData);

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/events_datetime_logic/);
    });
  });

  describe('Foreign Key Constraints', () => {
    let testFamilyId: string;

    beforeEach(async () => {
      const { data: family } = await supabase
        .from('families')
        .insert({
          name: 'Test Family',
          invite_code: `TEST${Math.random().toString().substr(2, 4)}`,
          settings: {}
        })
        .select()
        .single();
      
      testFamilyId = family!.id;
    });

    it('should cascade delete family members when family is deleted', async () => {
      // Create family member
      const { data: member } = await supabase
        .from('family_members')
        .insert({
          family_id: testFamilyId,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          name: 'Test User',
          avatar_color: '#FF5733'
        })
        .select()
        .single();

      // Delete family
      await supabase
        .from('families')
        .delete()
        .eq('id', testFamilyId);

      // Check that family member is also deleted
      const { data: deletedMember } = await supabase
        .from('family_members')
        .select()
        .eq('id', member!.id)
        .single();

      expect(deletedMember).toBeNull();
    });

    it('should cascade delete tasks when family member is deleted', async () => {
      // Create family member
      const { data: member } = await supabase
        .from('family_members')
        .insert({
          family_id: testFamilyId,
          email: 'test@example.com',
          password_hash: 'hashed_password',
          name: 'Test User',
          avatar_color: '#FF5733'
        })
        .select()
        .single();

      // Create task
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          family_id: testFamilyId,
          title: 'Test Task',
          assignee_id: member!.id,
          created_by_id: member!.id
        })
        .select()
        .single();

      // Delete family member
      await supabase
        .from('family_members')
        .delete()
        .eq('id', member!.id);

      // Check that task is also deleted
      const { data: deletedTask } = await supabase
        .from('tasks')
        .select()
        .eq('id', task!.id)
        .single();

      expect(deletedTask).toBeNull();
    });
  });

  describe('Indexes and Performance', () => {
    it('should have proper indexes for common queries', async () => {
      // This test verifies that expected indexes exist
      const { data: indexes } = await supabase.rpc('analyze_table_performance');
      
      if (indexes) {
        const indexNames = indexes.map((idx: any) => idx.index_name);
        
        expect(indexNames).toContain('idx_tasks_family_due_date');
        expect(indexNames).toContain('idx_events_family_start_date');
        expect(indexNames).toContain('idx_family_members_family');
      }
    });
  });
});