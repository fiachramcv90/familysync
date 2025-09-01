// Supabase client configuration for FamilySync application
// Story 1.3: Database Schema and Models

import { createClient } from '@supabase/supabase-js';
// Note: Database type will be defined here since it's not exported from types

// Environment variables configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with type safety
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});

// Database type definitions for Supabase client
export type Database = {
  public: {
    Tables: {
      families: {
        Row: import('../types/database').FamilyRecord;
        Insert: import('../types/database').FamilyInsert;
        Update: import('../types/database').FamilyUpdate;
      };
      family_members: {
        Row: import('../types/database').FamilyMemberRecord;
        Insert: import('../types/database').FamilyMemberInsert;
        Update: import('../types/database').FamilyMemberUpdate;
      };
      tasks: {
        Row: import('../types/database').TaskRecord;
        Insert: import('../types/database').TaskInsert;
        Update: import('../types/database').TaskUpdate;
      };
      events: {
        Row: import('../types/database').EventRecord;
        Insert: import('../types/database').EventInsert;
        Update: import('../types/database').EventUpdate;
      };
      sync_logs: {
        Row: import('../types/database').SyncLogRecord;
        Insert: import('../types/database').SyncLogInsert;
        Update: never; // Sync logs are immutable except for conflict resolution
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      role: 'admin' | 'member';
      task_status: 'pending' | 'in_progress' | 'completed';
      event_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high';
      sync_operation: 'INSERT' | 'UPDATE' | 'DELETE';
    };
  };
};

// Utility functions for common database operations
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
    
    async create(family: import('../types/database').FamilyInsert) {
      return supabase
        .from('families')
        .insert(family)
        .select()
        .single();
    },
    
    async update(id: string, updates: import('../types/database').FamilyUpdate) {
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
    
    async create(member: import('../types/database').FamilyMemberInsert) {
      return supabase
        .from('family_members')
        .insert(member)
        .select()
        .single();
    },
    
    async update(id: string, updates: import('../types/database').FamilyMemberUpdate) {
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
    async getByFamilyId(familyId: string, filters?: import('../types/database').TaskFilters) {
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
    
    async create(task: import('../types/database').TaskInsert) {
      return supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
    },
    
    async update(id: string, updates: import('../types/database').TaskUpdate) {
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
    async getByFamilyId(familyId: string, filters?: import('../types/database').EventFilters) {
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
    
    async create(event: import('../types/database').EventInsert) {
      return supabase
        .from('events')
        .insert(event)
        .select()
        .single();
    },
    
    async update(id: string, updates: import('../types/database').EventUpdate) {
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
  },

  // Sync log operations
  syncLogs: {
    async getByFamilyId(familyId: string, limit = 100) {
      return supabase
        .from('sync_logs')
        .select('*')
        .eq('family_id', familyId)
        .order('sync_timestamp', { ascending: false })
        .limit(limit);
    },
    
    async getConflicts(familyId: string) {
      return supabase
        .from('sync_logs')
        .select('*')
        .eq('family_id', familyId)
        .eq('conflict_resolved', false)
        .order('sync_timestamp', { ascending: false });
    },
    
    async resolveConflict(id: string) {
      return supabase
        .from('sync_logs')
        .update({ conflict_resolved: true })
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

// Auth helpers
export const auth = {
  async signUp(email: string, password: string, metadata?: any) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getCurrentUser() {
    return supabase.auth.getUser();
  },

  async getCurrentSession() {
    return supabase.auth.getSession();
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default supabase;