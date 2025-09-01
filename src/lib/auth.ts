import { createClient } from './supabase'
import { createServerSupabaseClient } from './supabase-server'

export interface AuthUser {
  id: string
  email: string
  familyId?: string
  role?: 'admin' | 'member'
}

export interface SignUpData {
  email: string
  password: string
  name: string
  familyName?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  static async signUp(data: SignUpData) {
    const supabase = createClient()
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    return authData
  }

  static async signIn(data: SignInData) {
    const supabase = createClient()
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return authData
  }

  static async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  }

  static async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return session
  }

  static async getServerSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return session
  }

  static async refreshToken() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data.session
  }

  static async updatePassword(newPassword: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      throw new Error(error.message)
    }
  }

  static async resetPassword(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) {
      throw new Error(error.message)
    }
  }
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}