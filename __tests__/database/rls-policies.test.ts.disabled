// Row Level Security policies tests
// Story 1.3: Database Schema and Models

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Test database configuration
const supabaseUrl = process.env.SUPABASE_TEST_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_TEST_ANON_KEY || 'test-key';

describe('Row Level Security Policies', () => {
  let testFamily1Id: string;
  let testFamily2Id: string;
  let family1AdminId: string;
  let family1MemberId: string;
  let family2MemberId: string;

  // Create authenticated clients for different users
  let family1AdminClient: ReturnType<typeof createClient>;
  let family1MemberClient: ReturnType<typeof createClient>;
  let family2MemberClient: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Create service role client for setup
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || 'service-key');

    // Create test families
    const { data: family1 } = await serviceClient
      .from('families')
      .insert({
        id: uuidv4(),
        name: 'Family 1',
        invite_code: 'FAMILY01',
        settings: {}
      })
      .select()
      .single();

    const { data: family2 } = await serviceClient
      .from('families')
      .insert({
        id: uuidv4(),
        name: 'Family 2',
        invite_code: 'FAMILY02',
        settings: {}
      })
      .select()
      .single();

    testFamily1Id = family1!.id;
    testFamily2Id = family2!.id;

    // Create test users and family members
    const family1AdminAuth = await serviceClient.auth.admin.createUser({
      email: 'admin1@test.com',
      password: 'password123',
      user_metadata: { family_id: testFamily1Id }
    });

    const family1MemberAuth = await serviceClient.auth.admin.createUser({
      email: 'member1@test.com',
      password: 'password123',
      user_metadata: { family_id: testFamily1Id }
    });

    const family2MemberAuth = await serviceClient.auth.admin.createUser({
      email: 'member2@test.com',
      password: 'password123',
      user_metadata: { family_id: testFamily2Id }
    });

    family1AdminId = family1AdminAuth.data.user!.id;
    family1MemberId = family1MemberAuth.data.user!.id;
    family2MemberId = family2MemberAuth.data.user!.id;

    // Create family member records
    await serviceClient.from('family_members').insert([
      {
        id: family1AdminId,
        family_id: testFamily1Id,
        email: 'admin1@test.com',
        password_hash: 'hash',
        name: 'Family 1 Admin',
        role: 'admin',
        avatar_color: '#FF5733'
      },
      {
        id: family1MemberId,
        family_id: testFamily1Id,
        email: 'member1@test.com',
        password_hash: 'hash',
        name: 'Family 1 Member',
        role: 'member',
        avatar_color: '#33FF57'
      },
      {
        id: family2MemberId,
        family_id: testFamily2Id,
        email: 'member2@test.com',
        password_hash: 'hash',
        name: 'Family 2 Member',
        role: 'member',
        avatar_color: '#3357FF'
      }
    ]);

    // Create authenticated clients
    family1AdminClient = createClient(supabaseUrl, supabaseKey);
    family1MemberClient = createClient(supabaseUrl, supabaseKey);
    family2MemberClient = createClient(supabaseUrl, supabaseKey);

    // Sign in users
    await family1AdminClient.auth.signInWithPassword({
      email: 'admin1@test.com',
      password: 'password123'
    });

    await family1MemberClient.auth.signInWithPassword({
      email: 'member1@test.com',
      password: 'password123'
    });

    await family2MemberClient.auth.signInWithPassword({
      email: 'member2@test.com',
      password: 'password123'
    });
  });

  afterAll(async () => {
    // Clean up test data
    const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || 'service-key');
    
    await serviceClient.from('families').delete().in('id', [testFamily1Id, testFamily2Id]);
    
    // Sign out all clients
    await family1AdminClient.auth.signOut();
    await family1MemberClient.auth.signOut();
    await family2MemberClient.auth.signOut();
  });

  describe('Family Table RLS', () => {
    it('should allow family members to read their own family', async () => {
      const { data: family, error } = await family1AdminClient
        .from('families')
        .select('*')
        .eq('id', testFamily1Id)
        .single();

      expect(error).toBeNull();
      expect(family?.id).toBe(testFamily1Id);
    });

    it('should prevent family members from reading other families', async () => {
      const { data: families, error } = await family1AdminClient
        .from('families')
        .select('*')
        .eq('id', testFamily2Id);

      // Should return empty array or null, not the other family
      expect(families?.length || 0).toBe(0);
    });

    it('should allow only family admins to update family settings', async () => {
      // Admin should be able to update
      const { data: updatedFamily, error: adminError } = await family1AdminClient
        .from('families')
        .update({ name: 'Updated Family Name' })
        .eq('id', testFamily1Id)
        .select()
        .single();

      expect(adminError).toBeNull();
      expect(updatedFamily?.name).toBe('Updated Family Name');

      // Regular member should not be able to update
      const { error: memberError } = await family1MemberClient
        .from('families')
        .update({ name: 'Member Update' })
        .eq('id', testFamily1Id);

      expect(memberError).not.toBeNull();
    });
  });

  describe('Family Members Table RLS', () => {
    it('should allow family members to see other members in their family', async () => {
      const { data: members, error } = await family1MemberClient
        .from('family_members')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(error).toBeNull();
      expect(members?.length).toBe(2); // Admin and member
    });

    it('should prevent family members from seeing members of other families', async () => {
      const { data: members, error } = await family1MemberClient
        .from('family_members')
        .select('*')
        .eq('family_id', testFamily2Id);

      expect(members?.length || 0).toBe(0);
    });

    it('should allow members to update their own profile', async () => {
      const { data: updatedMember, error } = await family1MemberClient
        .from('family_members')
        .update({ name: 'Updated Name' })
        .eq('id', family1MemberId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedMember?.name).toBe('Updated Name');
    });

    it('should allow admins to update any family member', async () => {
      const { data: updatedMember, error } = await family1AdminClient
        .from('family_members')
        .update({ name: 'Admin Updated Member' })
        .eq('id', family1MemberId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedMember?.name).toBe('Admin Updated Member');
    });

    it('should prevent regular members from updating other members', async () => {
      const { error } = await family1MemberClient
        .from('family_members')
        .update({ name: 'Unauthorized Update' })
        .eq('id', family1AdminId);

      expect(error).not.toBeNull();
    });
  });

  describe('Tasks Table RLS', () => {
    let testTaskId: string;

    beforeAll(async () => {
      // Create a test task
      const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || 'service-key');
      
      const { data: task } = await serviceClient
        .from('tasks')
        .insert({
          id: uuidv4(),
          family_id: testFamily1Id,
          title: 'Test Task',
          assignee_id: family1MemberId,
          created_by_id: family1AdminId,
          status: 'pending',
          priority: 'medium',
          category: 'task'
        })
        .select()
        .single();

      testTaskId = task!.id;
    });

    it('should allow family members to read family tasks', async () => {
      const { data: tasks, error } = await family1MemberClient
        .from('tasks')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(error).toBeNull();
      expect(tasks?.length).toBeGreaterThan(0);
    });

    it('should prevent access to tasks from other families', async () => {
      const { data: tasks, error } = await family2MemberClient
        .from('tasks')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(tasks?.length || 0).toBe(0);
    });

    it('should allow task assignee to update task', async () => {
      const { data: updatedTask, error } = await family1MemberClient
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', testTaskId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedTask?.status).toBe('in_progress');
    });

    it('should allow task creator to update task', async () => {
      const { data: updatedTask, error } = await family1AdminClient
        .from('tasks')
        .update({ priority: 'high' })
        .eq('id', testTaskId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedTask?.priority).toBe('high');
    });

    it('should allow family admin to update any task', async () => {
      const { data: updatedTask, error } = await family1AdminClient
        .from('tasks')
        .update({ title: 'Admin Updated Task' })
        .eq('id', testTaskId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedTask?.title).toBe('Admin Updated Task');
    });

    it('should allow family members to create tasks in their family', async () => {
      const { data: newTask, error } = await family1MemberClient
        .from('tasks')
        .insert({
          family_id: testFamily1Id,
          title: 'Member Created Task',
          assignee_id: family1MemberId,
          created_by_id: family1MemberId,
          status: 'pending',
          priority: 'low',
          category: 'task'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newTask?.title).toBe('Member Created Task');
    });

    it('should prevent creating tasks in other families', async () => {
      const { error } = await family1MemberClient
        .from('tasks')
        .insert({
          family_id: testFamily2Id, // Different family
          title: 'Unauthorized Task',
          assignee_id: family1MemberId,
          created_by_id: family1MemberId
        });

      expect(error).not.toBeNull();
    });
  });

  describe('Events Table RLS', () => {
    let testEventId: string;

    beforeAll(async () => {
      // Create a test event
      const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || 'service-key');
      
      const { data: event } = await serviceClient
        .from('events')
        .insert({
          id: uuidv4(),
          family_id: testFamily1Id,
          title: 'Test Event',
          assignee_id: family1MemberId,
          created_by_id: family1AdminId,
          start_datetime: new Date(Date.now() + 86400000).toISOString(),
          end_datetime: new Date(Date.now() + 90000000).toISOString(),
          status: 'scheduled'
        })
        .select()
        .single();

      testEventId = event!.id;
    });

    it('should allow family members to read family events', async () => {
      const { data: events, error } = await family1MemberClient
        .from('events')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(error).toBeNull();
      expect(events?.length).toBeGreaterThan(0);
    });

    it('should prevent access to events from other families', async () => {
      const { data: events, error } = await family2MemberClient
        .from('events')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(events?.length || 0).toBe(0);
    });

    it('should allow event assignee to update event', async () => {
      const { data: updatedEvent, error } = await family1MemberClient
        .from('events')
        .update({ status: 'in_progress' })
        .eq('id', testEventId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedEvent?.status).toBe('in_progress');
    });

    it('should prevent creating events in other families', async () => {
      const { error } = await family1MemberClient
        .from('events')
        .insert({
          family_id: testFamily2Id, // Different family
          title: 'Unauthorized Event',
          assignee_id: family1MemberId,
          created_by_id: family1MemberId,
          start_datetime: new Date(Date.now() + 86400000).toISOString(),
          end_datetime: new Date(Date.now() + 90000000).toISOString()
        });

      expect(error).not.toBeNull();
    });
  });

  describe('Sync Logs Table RLS', () => {
    let testSyncLogId: string;

    beforeAll(async () => {
      // Create a test sync log
      const serviceClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || 'service-key');
      
      const { data: syncLog } = await serviceClient
        .from('sync_logs')
        .insert({
          id: uuidv4(),
          family_id: testFamily1Id,
          table_name: 'tasks',
          record_id: uuidv4(),
          operation: 'INSERT',
          new_data: { title: 'Test Task' },
          created_by_id: family1AdminId
        })
        .select()
        .single();

      testSyncLogId = syncLog!.id;
    });

    it('should allow family members to read family sync logs', async () => {
      const { data: syncLogs, error } = await family1MemberClient
        .from('sync_logs')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(error).toBeNull();
      expect(syncLogs?.length).toBeGreaterThan(0);
    });

    it('should prevent access to sync logs from other families', async () => {
      const { data: syncLogs, error } = await family2MemberClient
        .from('sync_logs')
        .select('*')
        .eq('family_id', testFamily1Id);

      expect(syncLogs?.length || 0).toBe(0);
    });

    it('should allow only family admins to update conflict resolution', async () => {
      // Admin should be able to update
      const { data: updatedLog, error: adminError } = await family1AdminClient
        .from('sync_logs')
        .update({ conflict_resolved: true })
        .eq('id', testSyncLogId)
        .select()
        .single();

      expect(adminError).toBeNull();
      expect(updatedLog?.conflict_resolved).toBe(true);

      // Regular member should not be able to update
      const { error: memberError } = await family1MemberClient
        .from('sync_logs')
        .update({ conflict_resolved: false })
        .eq('id', testSyncLogId);

      expect(memberError).not.toBeNull();
    });

    it('should prevent regular users from inserting sync logs', async () => {
      const { error } = await family1MemberClient
        .from('sync_logs')
        .insert({
          family_id: testFamily1Id,
          table_name: 'tasks',
          record_id: uuidv4(),
          operation: 'UPDATE',
          old_data: { title: 'Old' },
          new_data: { title: 'New' }
        });

      // This should fail as only service role can insert sync logs
      expect(error).not.toBeNull();
    });
  });

  describe('Cross-Family Data Isolation', () => {
    it('should ensure complete data isolation between families', async () => {
      // Family 1 member should not see any data from Family 2
      const promises = [
        family1MemberClient.from('families').select('*').eq('id', testFamily2Id),
        family1MemberClient.from('family_members').select('*').eq('family_id', testFamily2Id),
        family1MemberClient.from('tasks').select('*').eq('family_id', testFamily2Id),
        family1MemberClient.from('events').select('*').eq('family_id', testFamily2Id),
        family1MemberClient.from('sync_logs').select('*').eq('family_id', testFamily2Id)
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.data?.length || 0).toBe(0);
      });
    });

    it('should ensure family 2 member cannot access family 1 data', async () => {
      // Family 2 member should not see any data from Family 1
      const promises = [
        family2MemberClient.from('families').select('*').eq('id', testFamily1Id),
        family2MemberClient.from('family_members').select('*').eq('family_id', testFamily1Id),
        family2MemberClient.from('tasks').select('*').eq('family_id', testFamily1Id),
        family2MemberClient.from('events').select('*').eq('family_id', testFamily1Id),
        family2MemberClient.from('sync_logs').select('*').eq('family_id', testFamily1Id)
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.data?.length || 0).toBe(0);
      });
    });
  });
});