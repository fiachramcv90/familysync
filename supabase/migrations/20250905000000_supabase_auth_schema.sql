-- Updated database schema compatible with Supabase Auth
-- Fixes authentication integration for production deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL, 
    settings JSON NOT NULL DEFAULT '{"weekStartDay": "sunday", "timezone": "UTC", "notifications": {"enabled": true}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT families_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
    CONSTRAINT families_invite_code_format CHECK (invite_code ~ '^[A-Z0-9]{6,8}$')
);

-- Create family_members table (integrated with Supabase Auth)
CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email TEXT NOT NULL, -- Synced from auth.users.email
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT family_members_name_length CHECK (length(name) >= 1 AND length(name) <= 100),
    CONSTRAINT family_members_avatar_color_format CHECK (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT family_members_user_id_unique UNIQUE(user_id)
);

-- Create family invites table for invitation flow
CREATE TABLE IF NOT EXISTS family_invites (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT family_invites_unique_pending UNIQUE(family_id, invited_email, status),
    CONSTRAINT family_invites_future_expiry CHECK (expires_at > created_at)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT REFERENCES family_members(id) ON DELETE SET NULL,
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
    CONSTRAINT tasks_completed_logic CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT tasks_sync_version_positive CHECK (sync_version > 0)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_families_updated_at 
    BEFORE UPDATE ON families 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create sync versioning trigger function
CREATE OR REPLACE FUNCTION increment_sync_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sync_version = OLD.sync_version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add sync version triggers
CREATE OR REPLACE TRIGGER increment_tasks_sync_version 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION increment_sync_version();

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth.get_family_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid() 
    AND is_active = true 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_family_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM family_members 
    WHERE user_id = auth.uid()
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "family_isolation" ON families
    FOR ALL TO authenticated
    USING (id = auth.get_family_id());

CREATE POLICY "family_members_isolation" ON family_members
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

CREATE POLICY "family_members_own_profile" ON family_members
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "tasks_family_isolation" ON tasks
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

CREATE POLICY "tasks_create" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id = auth.get_family_id() AND
        created_by_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "family_invites_family_isolation" ON family_invites
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Function to sync auth.users email changes to family_members
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE family_members 
  SET email = NEW.email, updated_at = NOW()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep email in sync
DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;
CREATE TRIGGER sync_user_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_email();