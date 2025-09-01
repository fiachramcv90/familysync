-- Rollback indexes migration
-- Story 1.3: Database Schema and Models

-- Drop performance analysis function
DROP FUNCTION IF EXISTS analyze_table_performance();

-- Drop text search indexes
DROP INDEX IF EXISTS idx_tasks_text_search;
DROP INDEX IF EXISTS idx_events_text_search;

-- Drop week range indexes
DROP INDEX IF EXISTS idx_tasks_week_range;
DROP INDEX IF EXISTS idx_events_week_range;

-- Drop recent activity indexes
DROP INDEX IF EXISTS idx_family_members_last_seen;
DROP INDEX IF EXISTS idx_tasks_updated_recent;
DROP INDEX IF EXISTS idx_events_updated_recent;

-- Drop sync_logs indexes
DROP INDEX IF EXISTS idx_sync_logs_family;
DROP INDEX IF EXISTS idx_sync_logs_table_record;
DROP INDEX IF EXISTS idx_sync_logs_conflicts;
DROP INDEX IF EXISTS idx_sync_logs_operation;

-- Drop events partial indexes
DROP INDEX IF EXISTS idx_events_upcoming;

-- Drop events indexes
DROP INDEX IF EXISTS idx_events_family_start_date;
DROP INDEX IF EXISTS idx_events_assignee;
DROP INDEX IF EXISTS idx_events_status;
DROP INDEX IF EXISTS idx_events_family_status_start;
DROP INDEX IF EXISTS idx_events_date_range;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_events_location;
DROP INDEX IF EXISTS idx_events_sync_version;

-- Drop tasks partial indexes
DROP INDEX IF EXISTS idx_tasks_active_due_date;

-- Drop tasks indexes
DROP INDEX IF EXISTS idx_tasks_family_due_date;
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_family_status_due;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_created_by;
DROP INDEX IF EXISTS idx_tasks_category;
DROP INDEX IF EXISTS idx_tasks_sync_version;

-- Drop family_members indexes
DROP INDEX IF EXISTS idx_family_members_family;
DROP INDEX IF EXISTS idx_family_members_email;
DROP INDEX IF EXISTS idx_family_members_role;
DROP INDEX IF EXISTS idx_family_members_active;

-- Drop families indexes
DROP INDEX IF EXISTS idx_families_invite_code;