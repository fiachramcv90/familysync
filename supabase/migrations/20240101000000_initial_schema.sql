-- Initial database schema for FamilySync application
-- Story 1.3: Database Schema and Models

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE families (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL, 
    settings JSON NOT NULL DEFAULT '{"weekStartDay": "sunday", "timezone": "UTC", "notifications": {"enabled": true}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT families_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
    CONSTRAINT families_invite_code_format CHECK (invite_code ~ '^[A-Z0-9]{8}$')
);

-- Create family_members table
CREATE TABLE family_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_color TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT family_members_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
    CONSTRAINT family_members_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
    CONSTRAINT family_members_avatar_color_format CHECK (avatar_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create tasks table
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    created_by_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    category TEXT NOT NULL DEFAULT 'task' CHECK (category IN ('task', 'event')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tasks_title_length CHECK (length(title) >= 1 AND length(title) <= 200),
    CONSTRAINT tasks_due_date_future CHECK (due_date IS NULL OR due_date > created_at),
    CONSTRAINT tasks_completed_logic CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT tasks_sync_version_positive CHECK (sync_version > 0)
);

-- Create events table
CREATE TABLE events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    created_by_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT events_title_length CHECK (length(title) >= 1 AND length(title) <= 200),
    CONSTRAINT events_datetime_logic CHECK (end_datetime > start_datetime),
    CONSTRAINT events_sync_version_positive CHECK (sync_version > 0)
);

-- Create sync_logs table for offline conflict resolution audit trail
CREATE TABLE sync_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSON,
    new_data JSON,
    conflict_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by_id TEXT REFERENCES family_members(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT sync_logs_table_name_valid CHECK (table_name IN ('families', 'family_members', 'tasks', 'events')),
    CONSTRAINT sync_logs_operation_data_logic CHECK (
        (operation = 'INSERT' AND old_data IS NULL AND new_data IS NOT NULL) OR
        (operation = 'UPDATE' AND old_data IS NOT NULL AND new_data IS NOT NULL) OR
        (operation = 'DELETE' AND old_data IS NOT NULL AND new_data IS NULL)
    )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_families_updated_at 
    BEFORE UPDATE ON families 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create sync versioning trigger function
CREATE OR REPLACE FUNCTION increment_sync_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sync_version = OLD.sync_version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add sync version triggers for tasks and events
CREATE TRIGGER increment_tasks_sync_version 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

CREATE TRIGGER increment_events_sync_version 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION increment_sync_version();