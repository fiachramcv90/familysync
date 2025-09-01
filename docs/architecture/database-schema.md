# Database Schema

```sql
-- Family coordination database schema
-- Initial SQLite implementation with PostgreSQL migration path

-- Families table for household coordination units
CREATE TABLE families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    settings JSON NOT NULL DEFAULT '{}',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Family members with role-based permissions
CREATE TABLE family_members (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_color TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
);

-- Tasks for family coordination
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    due_date DATETIME,
    completed_at DATETIME,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    category TEXT NOT NULL DEFAULT 'task' CHECK (category IN ('task', 'event')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES family_members (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES family_members (id) ON DELETE CASCADE
);

-- Events for time-specific family coordination
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    sync_version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES family_members (id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES family_members (id) ON DELETE CASCADE
);

-- Sync audit trail for offline conflict resolution
CREATE TABLE sync_logs (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'event')),
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    user_id TEXT NOT NULL,
    old_data JSON,
    new_data JSON NOT NULL,
    sync_version INTEGER NOT NULL,
    client_timestamp DATETIME NOT NULL,
    server_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES family_members (id) ON DELETE CASCADE
);

-- Performance indexes for weekly dashboard queries
CREATE INDEX idx_tasks_family_due_date ON tasks(family_id, due_date);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sync_version ON tasks(family_id, sync_version);

CREATE INDEX idx_events_family_start_date ON events(family_id, start_datetime);
CREATE INDEX idx_events_assignee ON events(assignee_id);
CREATE INDEX idx_events_sync_version ON events(family_id, sync_version);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_email ON family_members(email);

CREATE INDEX idx_sync_logs_family_timestamp ON sync_logs(family_id, server_timestamp);

-- Optimistic locking trigger to increment version on updates
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_task_version BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_event_version BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION increment_version();

-- Database functions for common operations
CREATE OR REPLACE FUNCTION get_user_family_id(user_id UUID)
RETURNS UUID AS $$
    SELECT family_id FROM family_members WHERE id = user_id LIMIT 1;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_family_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM family_members WHERE id = user_id AND role = 'admin');
$$ LANGUAGE SQL STABLE;
```
