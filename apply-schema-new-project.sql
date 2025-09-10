-- Apply FamilySync schema to new Supabase project
-- This creates all our custom tables with proper RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE DEFAULT UPPER(substring(uuid_generate_v4()::text, 1, 8)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1
);

-- Family members table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, family_id),
    UNIQUE(user_id, family_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    created_by_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    category TEXT NOT NULL DEFAULT 'task' CHECK (category IN ('task', 'chore', 'shopping', 'appointment', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT REFERENCES family_members(id) ON DELETE CASCADE,
    created_by_id TEXT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    category TEXT NOT NULL DEFAULT 'event' CHECK (category IN ('event', 'appointment', 'meeting', 'activity', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1
);

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families table
CREATE POLICY "Users can view their own family" ON families
    FOR SELECT USING (
        id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their own family" ON families
    FOR UPDATE USING (
        id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Users can insert new families" ON families
    FOR INSERT WITH CHECK (true);

-- RLS Policies for family_members table
CREATE POLICY "Users can view family members in their family" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their own profile" ON family_members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update family members" ON family_members
    FOR UPDATE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Users can insert family members" ON family_members
    FOR INSERT WITH CHECK (true);

-- RLS Policies for tasks table
CREATE POLICY "Users can view tasks in their family" ON tasks
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can insert tasks in their family" ON tasks
    FOR INSERT WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
        AND created_by_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update tasks in their family" ON tasks
    FOR UPDATE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can delete tasks in their family" ON tasks
    FOR DELETE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for events table
CREATE POLICY "Users can view events in their family" ON events
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can insert events in their family" ON events
    FOR INSERT WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
        AND created_by_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update events in their family" ON events
    FOR UPDATE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can delete events in their family" ON events
    FOR DELETE USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'Schema applied successfully to new project!' as status;