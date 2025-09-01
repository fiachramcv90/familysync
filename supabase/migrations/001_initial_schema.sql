-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_color TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- Create indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_email ON family_members(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Users can view their own family" ON families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members
            WHERE family_members.family_id = families.id
            AND family_members.user_id = auth.uid()
            AND family_members.is_active = true
        )
    );

CREATE POLICY "Family admins can update family" ON families
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_members
            WHERE family_members.family_id = families.id
            AND family_members.user_id = auth.uid()
            AND family_members.role = 'admin'
            AND family_members.is_active = true
        )
    );

-- Family members policies
CREATE POLICY "Users can view family members in their family" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Family admins can insert family members" ON family_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM family_members existing
            WHERE existing.family_id = family_members.family_id
            AND existing.user_id = auth.uid()
            AND existing.role = 'admin'
            AND existing.is_active = true
        )
    );

CREATE POLICY "Family admins can update family members" ON family_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM family_members existing
            WHERE existing.family_id = family_members.family_id
            AND existing.user_id = auth.uid()
            AND existing.role = 'admin'
            AND existing.is_active = true
        )
    );

CREATE POLICY "Users can update their own profile" ON family_members
    FOR UPDATE USING (
        user_id = auth.uid()
    )
    WITH CHECK (
        user_id = auth.uid()
        AND family_id = family_id
        AND role = role
        AND is_active = is_active
    );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    avatar_colors TEXT[] := ARRAY['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#48C9B0', '#F368E0', '#FFA502'];
    selected_color TEXT;
BEGIN
    -- Select a random avatar color
    selected_color := avatar_colors[1 + floor(random() * array_length(avatar_colors, 1))];
    
    -- Create a new family for the user if they're the first member
    IF NOT EXISTS (
        SELECT 1 FROM family_members WHERE user_id = NEW.id
    ) THEN
        -- This will be handled by the application layer
        -- as we need more information for family creation
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();