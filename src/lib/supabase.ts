// Supabase client configuration for FamilySync application
// Story 1.3: Database Schema and Models integrated with main application

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )
}

// Legacy support - export a default client instance for compatibility
export const supabase = createClient()

// Test connection function from Story 1.1
export const testSupabaseConnection = async () => {
  try {
    const client = createClient()
    const { error } = await client.from('families').select('count').limit(1)
    if (error) throw error
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    return { 
      success: false, 
      message: `Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Database utilities for common operations (Story 1.3)
export const db = {
  // Family operations
  families: {
    async getById(id: string) {
      return supabase
        .from('families')
        .select('*')
        .eq('id', id)
        .single();
    },
    
    async getByInviteCode(inviteCode: string) {
      return supabase
        .from('families')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
    },
    
    async create(family: any) {
      return supabase
        .from('families')
        .insert(family)
        .select()
        .single();
    },
    
    async update(id: string, updates: any) {
      return supabase
        .from('families')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    }
  },

  // Family member operations
  familyMembers: {
    async getByFamilyId(familyId: string) {
      return supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at');
    },
    
    async getById(id: string) {
      return supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();
    },
    
    async getByEmail(email: string) {
      return supabase
        .from('family_members')
        .select('*')
        .eq('email', email)
        .single();
    },
    
    async create(member: any) {
      return supabase
        .from('family_members')
        .insert(member)
        .select()
        .single();
    },
    
    async update(id: string, updates: any) {
      return supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    }
  },

  // Task operations
  tasks: {
    async getByFamilyId(familyId: string, filters?: any) {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:family_members!tasks_assignee_id_fkey(*),
          created_by:family_members!tasks_created_by_id_fkey(*)
        `)
        .eq('family_id', familyId);

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }

      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }

      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      return query.order('due_date', { nullsFirst: false });
    },
    
    async getById(id: string) {
      return supabase
        .from('tasks')
        .select(`
          *,
          assignee:family_members!tasks_assignee_id_fkey(*),
          created_by:family_members!tasks_created_by_id_fkey(*)
        `)
        .eq('id', id)
        .single();
    },
    
    async create(task: any) {
      return supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
    },
    
    async update(id: string, updates: any) {
      return supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    
    async delete(id: string) {
      return supabase
        .from('tasks')
        .delete()
        .eq('id', id);
    }
  },

  // Event operations
  events: {
    async getByFamilyId(familyId: string, filters?: any) {
      let query = supabase
        .from('events')
        .select(`
          *,
          assignee:family_members!events_assignee_id_fkey(*),
          created_by:family_members!events_created_by_id_fkey(*)
        `)
        .eq('family_id', familyId);

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters?.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }

      if (filters?.start_date_from) {
        query = query.gte('start_datetime', filters.start_date_from);
      }

      if (filters?.start_date_to) {
        query = query.lte('start_datetime', filters.start_date_to);
      }

      return query.order('start_datetime');
    },
    
    async getById(id: string) {
      return supabase
        .from('events')
        .select(`
          *,
          assignee:family_members!events_assignee_id_fkey(*),
          created_by:family_members!events_created_by_id_fkey(*)
        `)
        .eq('id', id)
        .single();
    },
    
    async create(event: any) {
      return supabase
        .from('events')
        .insert(event)
        .select()
        .single();
    },
    
    async update(id: string, updates: any) {
      return supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    
    async delete(id: string) {
      return supabase
        .from('events')
        .delete()
        .eq('id', id);
    }
  }
};

// Real-time subscription helpers
export const subscriptions = {
  // Subscribe to family data changes
  subscribeToFamily(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`family-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'families',
          filter: `id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to family member changes
  subscribeToFamilyMembers(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`family-members-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to task changes
  subscribeToTasks(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tasks-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to event changes
  subscribeToEvents(familyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`events-${familyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `family_id=eq.${familyId}`
        },
        callback
      )
      .subscribe();
  }
};

export default supabase;