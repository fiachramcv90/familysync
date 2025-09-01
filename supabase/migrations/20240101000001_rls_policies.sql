-- Row Level Security policies for family data isolation
-- Story 1.3: Database Schema and Models

-- Enable Row Level Security on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Create helper function to get authenticated user's family_id from JWT
CREATE OR REPLACE FUNCTION auth.get_family_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'family_id',
    (SELECT family_id FROM family_members WHERE id = auth.uid()::text LIMIT 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is family admin
CREATE OR REPLACE FUNCTION auth.is_family_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM family_members 
    WHERE id = auth.uid()::text 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for families table
-- Family members can only access their own family
CREATE POLICY "family_isolation" ON families
    FOR ALL TO authenticated
    USING (id = auth.get_family_id());

-- Only family admins can update family settings
CREATE POLICY "family_admin_update" ON families
    FOR UPDATE TO authenticated
    USING (id = auth.get_family_id() AND auth.is_family_admin());

-- RLS Policies for family_members table
-- Family members can only see other members in their family
CREATE POLICY "family_members_isolation" ON family_members
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Only family admins can insert new members (invite process)
CREATE POLICY "family_members_admin_insert" ON family_members
    FOR INSERT TO authenticated
    WITH CHECK (family_id = auth.get_family_id() AND auth.is_family_admin());

-- Members can update their own profile, admins can update any family member
CREATE POLICY "family_members_update" ON family_members
    FOR UPDATE TO authenticated
    USING (
        family_id = auth.get_family_id() AND 
        (id = auth.uid()::text OR auth.is_family_admin())
    );

-- Only admins can deactivate members (no hard delete)
CREATE POLICY "family_members_admin_deactivate" ON family_members
    FOR UPDATE TO authenticated
    USING (
        family_id = auth.get_family_id() AND 
        auth.is_family_admin() AND
        OLD.is_active = true AND NEW.is_active = false
    );

-- RLS Policies for tasks table
-- Family members can only access tasks in their family
CREATE POLICY "tasks_family_isolation" ON tasks
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Any family member can create tasks
CREATE POLICY "tasks_family_create" ON tasks
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id = auth.get_family_id() AND
        created_by_id = auth.uid()::text
    );

-- Task assignee or creator can update, admins can update any task
CREATE POLICY "tasks_update_permission" ON tasks
    FOR UPDATE TO authenticated
    USING (
        family_id = auth.get_family_id() AND
        (assignee_id = auth.uid()::text OR 
         created_by_id = auth.uid()::text OR 
         auth.is_family_admin())
    );

-- Only task creator or family admin can delete tasks
CREATE POLICY "tasks_delete_permission" ON tasks
    FOR DELETE TO authenticated
    USING (
        family_id = auth.get_family_id() AND
        (created_by_id = auth.uid()::text OR auth.is_family_admin())
    );

-- RLS Policies for events table
-- Family members can only access events in their family
CREATE POLICY "events_family_isolation" ON events
    FOR ALL TO authenticated
    USING (family_id = auth.get_family_id());

-- Any family member can create events
CREATE POLICY "events_family_create" ON events
    FOR INSERT TO authenticated
    WITH CHECK (
        family_id = auth.get_family_id() AND
        created_by_id = auth.uid()::text
    );

-- Event assignee or creator can update, admins can update any event
CREATE POLICY "events_update_permission" ON events
    FOR UPDATE TO authenticated
    USING (
        family_id = auth.get_family_id() AND
        (assignee_id = auth.uid()::text OR 
         created_by_id = auth.uid()::text OR 
         auth.is_family_admin())
    );

-- Only event creator or family admin can delete events
CREATE POLICY "events_delete_permission" ON events
    FOR DELETE TO authenticated
    USING (
        family_id = auth.get_family_id() AND
        (created_by_id = auth.uid()::text OR auth.is_family_admin())
    );

-- RLS Policies for sync_logs table
-- Family members can only access sync logs for their family
CREATE POLICY "sync_logs_family_isolation" ON sync_logs
    FOR SELECT TO authenticated
    USING (family_id = auth.get_family_id());

-- Only the system can insert sync logs (via triggers or service functions)
CREATE POLICY "sync_logs_system_insert" ON sync_logs
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Only family admins can update conflict resolution status
CREATE POLICY "sync_logs_admin_update" ON sync_logs
    FOR UPDATE TO authenticated
    USING (
        family_id = auth.get_family_id() AND 
        auth.is_family_admin()
    )
    WITH CHECK (
        family_id = auth.get_family_id() AND 
        auth.is_family_admin()
    );

-- Create audit trigger function for sync logging
CREATE OR REPLACE FUNCTION create_sync_log()
RETURNS TRIGGER AS $$
DECLARE
    family_id_val TEXT;
BEGIN
    -- Get family_id from the affected record
    CASE TG_TABLE_NAME
        WHEN 'families' THEN
            family_id_val := COALESCE(NEW.id, OLD.id);
        WHEN 'family_members' THEN
            family_id_val := COALESCE(NEW.family_id, OLD.family_id);
        WHEN 'tasks' THEN
            family_id_val := COALESCE(NEW.family_id, OLD.family_id);
        WHEN 'events' THEN
            family_id_val := COALESCE(NEW.family_id, OLD.family_id);
    END CASE;

    -- Insert sync log entry
    INSERT INTO sync_logs (
        family_id,
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        created_by_id
    ) VALUES (
        family_id_val,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()::text
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to all data tables
CREATE TRIGGER sync_log_families
    AFTER INSERT OR UPDATE OR DELETE ON families
    FOR EACH ROW EXECUTE FUNCTION create_sync_log();

CREATE TRIGGER sync_log_family_members
    AFTER INSERT OR UPDATE OR DELETE ON family_members
    FOR EACH ROW EXECUTE FUNCTION create_sync_log();

CREATE TRIGGER sync_log_tasks
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION create_sync_log();

CREATE TRIGGER sync_log_events
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION create_sync_log();