-- Rollback initial schema migration
-- Story 1.3: Database Schema and Models

-- Drop triggers
DROP TRIGGER IF EXISTS increment_events_sync_version ON events;
DROP TRIGGER IF EXISTS increment_tasks_sync_version ON tasks;

-- Drop trigger functions
DROP FUNCTION IF EXISTS increment_sync_version();

-- Drop update triggers
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
DROP TRIGGER IF EXISTS update_families_updated_at ON families;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS sync_logs;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS families;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";