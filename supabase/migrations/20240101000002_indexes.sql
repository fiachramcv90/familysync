-- Performance indexes for weekly dashboard queries
-- Story 1.3: Database Schema and Models

-- Indexes for families table
CREATE INDEX idx_families_invite_code ON families(invite_code);

-- Indexes for family_members table
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_members_role ON family_members(family_id, role);
CREATE INDEX idx_family_members_active ON family_members(family_id, is_active);

-- Composite indexes for tasks table optimized for weekly dashboard
CREATE INDEX idx_tasks_family_due_date ON tasks(family_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id, status);
CREATE INDEX idx_tasks_status ON tasks(family_id, status);
CREATE INDEX idx_tasks_family_status_due ON tasks(family_id, status, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks(family_id, priority, status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by_id, created_at);
CREATE INDEX idx_tasks_category ON tasks(family_id, category, status);
CREATE INDEX idx_tasks_sync_version ON tasks(family_id, sync_version);

-- Partial indexes for active tasks (better performance)
CREATE INDEX idx_tasks_active_due_date ON tasks(family_id, due_date, assignee_id) 
  WHERE status IN ('pending', 'in_progress') AND due_date IS NOT NULL;

-- Indexes for events table optimized for weekly dashboard
CREATE INDEX idx_events_family_start_date ON events(family_id, start_datetime);
CREATE INDEX idx_events_assignee ON events(assignee_id, status);
CREATE INDEX idx_events_status ON events(family_id, status);
CREATE INDEX idx_events_family_status_start ON events(family_id, status, start_datetime);
CREATE INDEX idx_events_date_range ON events(family_id, start_datetime, end_datetime);
CREATE INDEX idx_events_created_by ON events(created_by_id, created_at);
CREATE INDEX idx_events_location ON events(family_id, location) WHERE location IS NOT NULL;
CREATE INDEX idx_events_sync_version ON events(family_id, sync_version);

-- Partial indexes for upcoming events (better performance)
CREATE INDEX idx_events_upcoming ON events(family_id, start_datetime, assignee_id) 
  WHERE status IN ('scheduled', 'in_progress') AND start_datetime >= NOW();

-- Indexes for sync_logs table for conflict resolution queries
CREATE INDEX idx_sync_logs_family ON sync_logs(family_id, sync_timestamp);
CREATE INDEX idx_sync_logs_table_record ON sync_logs(table_name, record_id, sync_timestamp);
CREATE INDEX idx_sync_logs_conflicts ON sync_logs(family_id, conflict_resolved, sync_timestamp) 
  WHERE conflict_resolved = false;
CREATE INDEX idx_sync_logs_operation ON sync_logs(family_id, operation, sync_timestamp);

-- Text search indexes for title/description search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_text_search ON tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_events_text_search ON events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Indexes for common date range queries (weekly dashboard)
CREATE INDEX idx_tasks_week_range ON tasks(family_id, due_date, status) 
  WHERE due_date >= CURRENT_DATE - INTERVAL '7 days' 
  AND due_date <= CURRENT_DATE + INTERVAL '14 days';

CREATE INDEX idx_events_week_range ON events(family_id, start_datetime, status) 
  WHERE start_datetime >= CURRENT_DATE - INTERVAL '7 days' 
  AND start_datetime <= CURRENT_DATE + INTERVAL '14 days';

-- Indexes for user activity and audit queries
CREATE INDEX idx_family_members_last_seen ON family_members(family_id, last_seen_at) WHERE is_active = true;
CREATE INDEX idx_tasks_updated_recent ON tasks(family_id, updated_at) WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX idx_events_updated_recent ON events(family_id, updated_at) WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days';

-- Performance statistics and monitoring
-- Create a function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_table_performance()
RETURNS TABLE(
  table_name text,
  index_name text,
  index_size text,
  table_size text,
  index_usage_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.schemaname || '.' || t.tablename as table_name,
    i.indexname as index_name,
    pg_size_pretty(pg_relation_size(i.indexname::regclass)) as index_size,
    pg_size_pretty(pg_relation_size(t.tablename::regclass)) as table_size,
    s.idx_scan as index_usage_count
  FROM pg_tables t
  LEFT JOIN pg_indexes i ON t.tablename = i.tablename
  LEFT JOIN pg_stat_user_indexes s ON i.indexname = s.indexname
  WHERE t.schemaname = 'public'
  AND t.tablename IN ('families', 'family_members', 'tasks', 'events', 'sync_logs')
  ORDER BY s.idx_scan DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;