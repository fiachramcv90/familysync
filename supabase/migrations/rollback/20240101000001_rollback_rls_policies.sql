-- Rollback RLS policies migration
-- Story 1.3: Database Schema and Models

-- Drop audit triggers
DROP TRIGGER IF EXISTS sync_log_families ON families;
DROP TRIGGER IF EXISTS sync_log_family_members ON family_members;
DROP TRIGGER IF EXISTS sync_log_tasks ON tasks;
DROP TRIGGER IF EXISTS sync_log_events ON events;

-- Drop audit trigger function
DROP FUNCTION IF EXISTS create_sync_log();

-- Drop RLS policies for sync_logs
DROP POLICY IF EXISTS "sync_logs_admin_update" ON sync_logs;
DROP POLICY IF EXISTS "sync_logs_system_insert" ON sync_logs;
DROP POLICY IF EXISTS "sync_logs_family_isolation" ON sync_logs;

-- Drop RLS policies for events
DROP POLICY IF EXISTS "events_delete_permission" ON events;
DROP POLICY IF EXISTS "events_update_permission" ON events;
DROP POLICY IF EXISTS "events_family_create" ON events;
DROP POLICY IF EXISTS "events_family_isolation" ON events;

-- Drop RLS policies for tasks
DROP POLICY IF EXISTS "tasks_delete_permission" ON tasks;
DROP POLICY IF EXISTS "tasks_update_permission" ON tasks;
DROP POLICY IF EXISTS "tasks_family_create" ON tasks;
DROP POLICY IF EXISTS "tasks_family_isolation" ON tasks;

-- Drop RLS policies for family_members
DROP POLICY IF EXISTS "family_members_admin_deactivate" ON family_members;
DROP POLICY IF EXISTS "family_members_update" ON family_members;
DROP POLICY IF EXISTS "family_members_admin_insert" ON family_members;
DROP POLICY IF EXISTS "family_members_isolation" ON family_members;

-- Drop RLS policies for families
DROP POLICY IF EXISTS "family_admin_update" ON families;
DROP POLICY IF EXISTS "family_isolation" ON families;

-- Drop helper functions
DROP FUNCTION IF EXISTS auth.is_family_admin();
DROP FUNCTION IF EXISTS auth.get_family_id();

-- Disable Row Level Security on all tables
ALTER TABLE sync_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;