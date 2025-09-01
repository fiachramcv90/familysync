// Database type definitions for Supabase
// These will be generated/updated when we set up the actual database schema

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'admin' | 'member'
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: 'admin' | 'member'
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          family_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed'
          assigned_to: string | null
          due_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          family_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}