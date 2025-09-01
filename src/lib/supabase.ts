import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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