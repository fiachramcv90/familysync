// Task API Routes
// Story 2.1: Task Creation and Basic Management

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createTaskInputSchema } from '@/lib/validations';
import { TaskRecord } from '@/types/database';

// GET /api/tasks - Fetch tasks for the authenticated user's family
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week');
    const assigneeId = searchParams.get('assigneeId');

    // Get user's family ID
    const { data: familyMemberData, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (memberError || !familyMemberData) {
      return NextResponse.json({ error: 'Family membership not found' }, { status: 403 });
    }

    // Build query for tasks
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:family_members!tasks_assignee_id_fkey(id, name, avatar_color, role),
        created_by:family_members!tasks_created_by_id_fkey(id, name, avatar_color, role)
      `)
      .eq('family_id', familyMemberData.family_id);

    // Add week filter if provided
    if (week) {
      const weekStart = new Date(week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      query = query.gte('due_date', weekStart.toISOString());
      query = query.lte('due_date', weekEnd.toISOString());
    }

    // Add assignee filter if provided
    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId);
    }

    // Execute query
    const { data: tasks, error: tasksError } = await query.order('due_date', { ascending: true, nullsFirst: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createTaskInputSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { title, description, assigneeId, dueDate, category, priority } = validation.data;

    // Get user's family ID
    const { data: familyMemberData, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('id', user.id)
      .single();

    if (memberError || !familyMemberData) {
      return NextResponse.json({ error: 'Family membership not found' }, { status: 403 });
    }

    // Validate that assignee is in the same family
    const { data: assigneeData, error: assigneeError } = await supabase
      .from('family_members')
      .select('id, family_id')
      .eq('id', assigneeId)
      .eq('family_id', familyMemberData.family_id)
      .single();

    if (assigneeError || !assigneeData) {
      return NextResponse.json({ error: 'Invalid assignee - must be a family member' }, { status: 400 });
    }

    // Create the task
    const taskData: Omit<TaskRecord, 'id' | 'created_at' | 'updated_at'> = {
      family_id: familyMemberData.family_id,
      title: title.trim(),
      description: description?.trim() || null,
      assignee_id: assigneeId,
      created_by_id: user.id,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      completed_at: null,
      status: 'pending',
      category: category || 'task',
      priority: priority || 'medium',
      sync_version: 1,
    };

    const { data: createdTask, error: createError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        assignee:family_members!tasks_assignee_id_fkey(id, name, avatar_color, role),
        created_by:family_members!tasks_created_by_id_fkey(id, name, avatar_color, role)
      `)
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Return the created task with populated relationships
    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] will be handled by a separate route file
// DELETE /api/tasks/[id] will be handled by a separate route file