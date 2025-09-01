import { createServerSupabaseClient } from './supabase-server'

export class ServerAuthService {
  static async getServerSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return session
  }
}