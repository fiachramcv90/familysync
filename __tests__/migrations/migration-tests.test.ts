// Database migration tests
// Story 1.3: Database Schema and Models

import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

// Test database configuration
const testDbUrl = process.env.SUPABASE_TEST_URL || 'http://localhost:54321';
const testDbKey = process.env.SUPABASE_TEST_SERVICE_KEY || 'test-service-key';
const migrationScript = join(__dirname, '../../supabase/migrate.sh');

const supabase = createClient(testDbUrl, testDbKey);

describe('Database Migration Tests', () => {
  beforeAll(async () => {
    // Ensure we have a clean test database
    await execAsync(`${migrationScript} reset`);
  });

  afterAll(async () => {
    // Clean up after tests
    await execAsync(`${migrationScript} reset`);
  });

  describe('Migration Script Functionality', () => {
    it('should show clean status initially', async () => {
      const { stdout } = await execAsync(`${migrationScript} status`);
      expect(stdout).toContain('No migrations table found');
    });

    it('should execute migration up successfully', async () => {
      const { stdout } = await execAsync(`${migrationScript} up`);
      expect(stdout).toContain('Successfully applied migration');
      expect(stdout).toContain('All migrations applied successfully');
    });

    it('should show applied migrations in status', async () => {
      const { stdout } = await execAsync(`${migrationScript} status`);
      expect(stdout).toContain('Applied Migrations:');
      expect(stdout).toContain('20240101000000_initial_schema');
      expect(stdout).toContain('20240101000001_rls_policies');
      expect(stdout).toContain('20240101000002_indexes');
    });

    it('should not apply same migration twice', async () => {
      // Try to run migrations again
      const { stdout } = await execAsync(`${migrationScript} up`);
      expect(stdout).toContain('already applied, skipping');
    });
  });

  describe('Schema Validation After Migration', () => {
    it('should have all required tables', async () => {
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['families', 'family_members', 'tasks', 'events', 'sync_logs']);

      expect(error).toBeNull();
      expect(tables?.length).toBe(5);
      
      const tableNames = tables!.map(t => t.table_name);
      expect(tableNames).toContain('families');
      expect(tableNames).toContain('family_members');
      expect(tableNames).toContain('tasks');
      expect(tableNames).toContain('events');
      expect(tableNames).toContain('sync_logs');
    });

    it('should have all required columns in families table', async () => {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'families')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      
      const columnNames = columns!.map(c => c.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('invite_code');
      expect(columnNames).toContain('settings');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have all required columns in tasks table', async () => {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'tasks')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      
      const columnNames = columns!.map(c => c.column_name);
      const requiredColumns = [
        'id', 'family_id', 'title', 'description', 'assignee_id', 
        'created_by_id', 'due_date', 'completed_at', 'status', 
        'category', 'priority', 'sync_version', 'created_at', 'updated_at'
      ];
      
      requiredColumns.forEach(col => {
        expect(columnNames).toContain(col);
      });
    });

    it('should have all required columns in events table', async () => {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'events')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      
      const columnNames = columns!.map(c => c.column_name);
      const requiredColumns = [
        'id', 'family_id', 'title', 'description', 'assignee_id',
        'created_by_id', 'start_datetime', 'end_datetime', 'location',
        'status', 'sync_version', 'created_at', 'updated_at'
      ];
      
      requiredColumns.forEach(col => {
        expect(columnNames).toContain(col);
      });
    });
  });

  describe('Constraint Validation After Migration', () => {
    it('should have proper CHECK constraints', async () => {
      const { data: constraints, error } = await supabase
        .from('information_schema.check_constraints')
        .select('constraint_name, check_clause')
        .eq('constraint_schema', 'public');

      expect(error).toBeNull();
      expect(constraints?.length).toBeGreaterThan(0);
      
      const constraintNames = constraints!.map(c => c.constraint_name);
      expect(constraintNames.some(name => name.includes('families_invite_code_format'))).toBe(true);
      expect(constraintNames.some(name => name.includes('tasks_completed_logic'))).toBe(true);
      expect(constraintNames.some(name => name.includes('events_datetime_logic'))).toBe(true);
    });

    it('should have proper foreign key constraints', async () => {
      const { data: foreignKeys, error } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name')
        .eq('constraint_type', 'FOREIGN KEY')
        .eq('constraint_schema', 'public');

      expect(error).toBeNull();
      expect(foreignKeys?.length).toBeGreaterThan(0);
      
      // Should have foreign keys for family_id references
      const familyIdConstraints = foreignKeys!.filter(fk => 
        fk.constraint_name.includes('family_id') || 
        fk.constraint_name.includes('families')
      );
      expect(familyIdConstraints.length).toBeGreaterThan(0);
    });

    it('should have proper unique constraints', async () => {
      const { data: uniqueConstraints, error } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, table_name')
        .eq('constraint_type', 'UNIQUE')
        .eq('constraint_schema', 'public');

      expect(error).toBeNull();
      
      const constraintNames = uniqueConstraints!.map(c => c.constraint_name);
      expect(constraintNames.some(name => name.includes('invite_code'))).toBe(true);
      expect(constraintNames.some(name => name.includes('email'))).toBe(true);
    });
  });

  describe('Index Validation After Migration', () => {
    it('should have all performance indexes', async () => {
      const { data: indexes, error } = await supabase
        .from('pg_indexes')
        .select('indexname, tablename')
        .eq('schemaname', 'public');

      expect(error).toBeNull();
      expect(indexes?.length).toBeGreaterThan(0);
      
      const indexNames = indexes!.map(i => i.indexname);
      
      // Check for key performance indexes
      expect(indexNames).toContain('idx_tasks_family_due_date');
      expect(indexNames).toContain('idx_events_family_start_date');
      expect(indexNames).toContain('idx_family_members_family');
      expect(indexNames).toContain('idx_family_members_email');
      expect(indexNames).toContain('idx_tasks_assignee');
      expect(indexNames).toContain('idx_events_assignee');
    });

    it('should have text search indexes', async () => {
      const { data: indexes, error } = await supabase
        .from('pg_indexes')
        .select('indexname, indexdef')
        .eq('schemaname', 'public');

      expect(error).toBeNull();
      
      const textSearchIndexes = indexes!.filter(i => 
        i.indexdef?.includes('gin') && i.indexdef?.includes('to_tsvector')
      );
      
      expect(textSearchIndexes.length).toBeGreaterThan(0);
    });
  });

  describe('Trigger Validation After Migration', () => {
    it('should have updated_at triggers on all tables', async () => {
      const { data: triggers, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_object_table')
        .eq('trigger_schema', 'public');

      expect(error).toBeNull();
      
      const updateTriggers = triggers!.filter(t => 
        t.trigger_name.includes('updated_at')
      );
      
      expect(updateTriggers.length).toBeGreaterThan(0);
      
      const tablesWithTriggers = updateTriggers.map(t => t.event_object_table);
      expect(tablesWithTriggers).toContain('families');
      expect(tablesWithTriggers).toContain('family_members');
      expect(tablesWithTriggers).toContain('tasks');
      expect(tablesWithTriggers).toContain('events');
    });

    it('should have sync version triggers on tasks and events', async () => {
      const { data: triggers, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_object_table')
        .eq('trigger_schema', 'public');

      expect(error).toBeNull();
      
      const syncTriggers = triggers!.filter(t => 
        t.trigger_name.includes('sync_version')
      );
      
      expect(syncTriggers.length).toBe(2); // tasks and events
      
      const tablesWithSyncTriggers = syncTriggers.map(t => t.event_object_table);
      expect(tablesWithSyncTriggers).toContain('tasks');
      expect(tablesWithSyncTriggers).toContain('events');
    });

    it('should have audit triggers for sync logging', async () => {
      const { data: triggers, error } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_object_table')
        .eq('trigger_schema', 'public');

      expect(error).toBeNull();
      
      const auditTriggers = triggers!.filter(t => 
        t.trigger_name.includes('sync_log')
      );
      
      expect(auditTriggers.length).toBeGreaterThan(0);
    });
  });

  describe('RLS Policy Validation After Migration', () => {
    it('should have RLS enabled on all tables', async () => {
      const { data: tables, error } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .in('tablename', ['families', 'family_members', 'tasks', 'events', 'sync_logs']);

      expect(error).toBeNull();
      
      tables!.forEach(table => {
        expect(table.rowsecurity).toBe(true);
      });
    });

    it('should have isolation policies for all tables', async () => {
      const { data: policies, error } = await supabase
        .from('pg_policies')
        .select('policyname, tablename')
        .eq('schemaname', 'public');

      expect(error).toBeNull();
      expect(policies?.length).toBeGreaterThan(0);
      
      const policyNames = policies!.map(p => p.policyname);
      expect(policyNames.some(name => name.includes('family_isolation'))).toBe(true);
      expect(policyNames.some(name => name.includes('family_members_isolation'))).toBe(true);
      expect(policyNames.some(name => name.includes('tasks_family_isolation'))).toBe(true);
      expect(policyNames.some(name => name.includes('events_family_isolation'))).toBe(true);
    });
  });

  describe('Migration Rollback Tests', () => {
    it('should rollback last migration successfully', async () => {
      const { stdout } = await execAsync(`${migrationScript} down 1`);
      expect(stdout).toContain('Successfully rolled back migration');
    });

    it('should show correct status after rollback', async () => {
      const { stdout } = await execAsync(`${migrationScript} status`);
      // Should show one less migration
      expect(stdout).toContain('Applied Migrations:');
    });

    it('should be able to reapply rolled back migration', async () => {
      const { stdout } = await execAsync(`${migrationScript} up`);
      expect(stdout).toContain('Successfully applied migration');
    });

    it('should reset database completely', async () => {
      const { stdout } = await execAsync(`${migrationScript} reset`);
      expect(stdout).toContain('Database reset completed');
      
      // Check that migration table is gone
      const { stdout: statusOutput } = await execAsync(`${migrationScript} status`);
      expect(statusOutput).toContain('No migrations table found');
    });

    it('should be able to apply all migrations after reset', async () => {
      const { stdout } = await execAsync(`${migrationScript} up`);
      expect(stdout).toContain('All migrations applied successfully');
    });
  });

  describe('Migration File Integrity', () => {
    it('should have all required migration files', () => {
      const migrationDir = join(__dirname, '../../supabase/migrations');
      
      const initialSchema = readFileSync(join(migrationDir, '20240101000000_initial_schema.sql'), 'utf8');
      expect(initialSchema).toContain('CREATE TABLE families');
      expect(initialSchema).toContain('CREATE TABLE family_members');
      expect(initialSchema).toContain('CREATE TABLE tasks');
      expect(initialSchema).toContain('CREATE TABLE events');
      expect(initialSchema).toContain('CREATE TABLE sync_logs');

      const rlsPolicies = readFileSync(join(migrationDir, '20240101000001_rls_policies.sql'), 'utf8');
      expect(rlsPolicies).toContain('ALTER TABLE families ENABLE ROW LEVEL SECURITY');
      expect(rlsPolicies).toContain('CREATE POLICY');

      const indexes = readFileSync(join(migrationDir, '20240101000002_indexes.sql'), 'utf8');
      expect(indexes).toContain('CREATE INDEX');
      expect(indexes).toContain('idx_tasks_family_due_date');
    });

    it('should have all required rollback files', () => {
      const rollbackDir = join(__dirname, '../../supabase/migrations/rollback');
      
      const rollbackInitial = readFileSync(join(rollbackDir, '20240101000000_rollback_initial_schema.sql'), 'utf8');
      expect(rollbackInitial).toContain('DROP TABLE');
      
      const rollbackRls = readFileSync(join(rollbackDir, '20240101000001_rollback_rls_policies.sql'), 'utf8');
      expect(rollbackRls).toContain('DROP POLICY');
      expect(rollbackRls).toContain('DISABLE ROW LEVEL SECURITY');
      
      const rollbackIndexes = readFileSync(join(rollbackDir, '20240101000002_rollback_indexes.sql'), 'utf8');
      expect(rollbackIndexes).toContain('DROP INDEX');
    });
  });
});