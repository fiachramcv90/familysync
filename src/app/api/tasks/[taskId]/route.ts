// Task Update API Routes
// Story 2.2: Task Status Management and Completion

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { updateTaskInputSchema } from '@/lib/validations';
import { TaskRecord } from '@/types/database';

// PATCH /api/tasks/[taskId] - Update an existing task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { taskId } = await params;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateTaskInputSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Get user's family ID
    const { data: familyMemberData, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (memberError || !familyMemberData) {
      return NextResponse.json({ error: 'Family membership not found' }, { status: 403 });
    }

    // Fetch the existing task to validate ownership and get current version
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*, assignee:family_members!tasks_assignee_id_fkey(id, name, avatar_color, role)')
      .eq('id', taskId)
      .eq('family_id', familyMemberData.family_id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    // Handle optimistic locking if version is provided
    const { version, ...updateData } = validation.data;
    if (version !== undefined && version !== existingTask.sync_version) {
      return NextResponse.json({
        error: 'Conflict detected - task has been modified',
        latestVersion: existingTask,
        providedVersion: version,
        currentVersion: existingTask.sync_version
      }, { status: 409 });
    }

    // Prepare update object
    const updates: Partial<TaskRecord> = {
      updated_at: new Date().toISOString(),
      sync_version: existingTask.sync_version + 1,
    };

    // Update title if provided
    if (updateData.title !== undefined) {
      updates.title = updateData.title.trim();
    }

    // Update description if provided
    if (updateData.description !== undefined) {
      updates.description = updateData.description?.trim() || null;
    }

    // Update status if provided
    if (updateData.status !== undefined) {
      updates.status = updateData.status;
      
      // Handle completion timestamp
      if (updateData.status === 'completed' && !existingTask.completed_at) {
        updates.completed_at = updateData.completedAt 
          ? (typeof updateData.completedAt === 'string' ? updateData.completedAt : updateData.completedAt.toISOString())
          : new Date().toISOString();
      } else if (updateData.status !== 'completed' && existingTask.completed_at) {
        updates.completed_at = null;
      }
    }

    // Handle explicit completion timestamp
    if (updateData.completedAt !== undefined) {
      updates.completed_at = updateData.completedAt 
        ? (typeof updateData.completedAt === 'string' ? updateData.completedAt : updateData.completedAt.toISOString())
        : null;
    }

    // Update due date if provided
    if (updateData.dueDate !== undefined) {
      updates.due_date = updateData.dueDate 
        ? (typeof updateData.dueDate === 'string' ? updateData.dueDate : updateData.dueDate.toISOString())
        : null;
    }

    // Update priority if provided
    if (updateData.priority !== undefined) {
      updates.priority = updateData.priority;
    }

    // Update assignee if provided (with validation)
    if (updateData.assigneeId !== undefined) {
      // Validate that new assignee is in the same family
      const { data: assigneeData, error: assigneeError } = await supabase
        .from('family_members')
        .select('id, family_id')
        .eq('id', updateData.assigneeId)
        .eq('family_id', familyMemberData.family_id)
        .single();

      if (assigneeError || !assigneeData) {
        return NextResponse.json({ 
          error: 'Invalid assignee - must be a family member',
          details: 'The selected assignee is not part of your family'
        }, { status: 400 });
      }

      updates.assignee_id = updateData.assigneeId;
    }

    // Permission check: only allow updates by task creator, current assignee, or family admin
    const canUpdate = (
      user.id === existingTask.created_by_id || // Creator
      user.id === existingTask.assignee_id ||   // Current assignee
      user.id === updates.assignee_id           // New assignee (for accepting assignment)
    );

    if (!canUpdate) {
      // Check if user is family admin
      const { data: userRole } = await supabase
        .from('family_members')
        .select('role')
        .eq('id', user.id)
        .eq('family_id', familyMemberData.family_id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.json({ 
          error: 'Permission denied',
          details: 'Only the task creator, assignee, or family admin can update this task'
        }, { status: 403 });
      }
    }

    // Perform the update
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('family_id', familyMemberData.family_id)
      .select(`
        *,
        assignee:family_members!tasks_assignee_id_fkey(id, name, avatar_color, role, email),
        created_by:family_members!tasks_created_by_id_fkey(id, name, avatar_color, role)
      `)
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Log the update for audit purposes
    console.log(`Task ${taskId} updated by user ${user.id}:`, {
      changes: Object.keys(updates).filter(key => key !== 'updated_at' && key !== 'sync_version'),
      newStatus: updates.status,
      newAssignee: updates.assignee_id
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/tasks/[taskId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/tasks/[taskId] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { taskId } = await params;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's family ID
    const { data: familyMemberData, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (memberError || !familyMemberData) {
      return NextResponse.json({ error: 'Family membership not found' }, { status: 403 });
    }

    // Fetch the task with family isolation
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:family_members!tasks_assignee_id_fkey(id, name, avatar_color, role, email),
        created_by:family_members!tasks_created_by_id_fkey(id, name, avatar_color, role)
      `)
      .eq('id', taskId)
      .eq('family_id', familyMemberData.family_id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Unexpected error in GET /api/tasks/[taskId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { taskId } = await params;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's family ID
    const { data: familyMemberData, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (memberError || !familyMemberData) {
      return NextResponse.json({ error: 'Family membership not found' }, { status: 403 });
    }

    // Fetch the existing task to validate permissions
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('family_id', familyMemberData.family_id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    // Permission check: only allow deletion by task creator or family admin
    const canDelete = user.id === existingTask.created_by_id;

    if (!canDelete) {
      // Check if user is family admin
      const { data: userRole } = await supabase
        .from('family_members')
        .select('role')
        .eq('id', user.id)
        .eq('family_id', familyMemberData.family_id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.json({ 
          error: 'Permission denied',
          details: 'Only the task creator or family admin can delete this task'
        }, { status: 403 });
      }
    }

    // Delete the task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('family_id', familyMemberData.family_id);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    // Log the deletion for audit purposes
    console.log(`Task ${taskId} deleted by user ${user.id}`);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/tasks/[taskId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}