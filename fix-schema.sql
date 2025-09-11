-- Fix schema to be compatible with existing tables
-- The families and family_members tables already exist with UUID IDs

-- Check what tables currently exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('families', 'family_members', 'tasks')
ORDER BY table_name, column_name;

-- Add missing columns to families table if they don't exist
DO $$ 
BEGIN
    -- Add invite_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'families' AND column_name = 'invite_code') THEN
        ALTER TABLE families ADD COLUMN invite_code TEXT UNIQUE;
        -- Generate invite codes for existing families
        UPDATE families SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
        ALTER TABLE families ALTER COLUMN invite_code SET NOT NULL;
    END IF;
    
    -- Add settings if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'families' AND column_name = 'settings') THEN
        ALTER TABLE families ADD COLUMN settings JSON DEFAULT '{"weekStartDay": "sunday", "timezone": "UTC", "notifications": {"enabled": true}}';
    END IF;
END $$;

-- Add missing columns to family_members table if they don't exist
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'role') THEN
        ALTER TABLE family_members ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));
    END IF;
    
    -- Add avatar_color if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'avatar_color') THEN
        ALTER TABLE family_members ADD COLUMN avatar_color TEXT DEFAULT '#3B82F6';
    END IF;
    
    -- Add is_active if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'is_active') THEN
        ALTER TABLE family_members ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add last_seen_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'last_seen_at') THEN
        ALTER TABLE family_members ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add family_id if it doesn't exist (reference to families)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'family_id') THEN
        ALTER TABLE family_members ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE;
        -- You'll need to set family_id values for existing records manually
    END IF;
    
    -- Add user_id if it doesn't exist (reference to auth.users)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_members' AND column_name = 'user_id') THEN
        ALTER TABLE family_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create tasks table with UUID foreign keys to match existing schema
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_by_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
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

-- Enable Row Level Security on tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create helper functions for RLS
CREATE OR REPLACE FUNCTION auth.get_family_id() 
RETURNS UUID AS $$
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

-- Basic RLS policies for families
DROP POLICY IF EXISTS "family_isolation" ON families;
CREATE POLICY "family_isolation" ON families
    FOR ALL TO authenticated
    USING (id = auth.get_family_id());

-- Basic RLS policies for family_members
DROP POLICY IF EXISTS "family_members_isolation" ON family_members;
CREATE POLICY "family_members_isolation" ON family_members
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Basic RLS policies for tasks
DROP POLICY IF EXISTS "tasks_family_isolation" ON tasks;
CREATE POLICY "tasks_family_isolation" ON tasks
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Show final table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('families', 'family_members', 'tasks')
ORDER BY table_name, ordinal_position;