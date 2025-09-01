import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Environment variables - these will be set up in next step
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a supabase client for server-side operations
export const createServerSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('families').select('count').limit(1)
    if (error) throw error
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    return { 
      success: false, 
      message: `Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}