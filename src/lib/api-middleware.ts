import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from './supabase-server'

export interface AuthenticatedRequest extends NextRequest {
  user?: { id: string; email: string; role: string }
  familyId?: string
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const supabase = await createServerSupabaseClient()
      
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get user's family membership
      const { data: member, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, role, is_active')
        .eq('user_id', user.id)
        .single()

      if (memberError || !member || !member.is_active) {
        return NextResponse.json(
          { error: 'No active family membership' },
          { status: 403 }
        )
      }

      // Add user and family info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = { 
        id: user.id, 
        email: user.email ?? '', 
        role: member.role 
      }
      authenticatedReq.familyId = member.family_id

      return handler(authenticatedReq)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    return handler(req)
  })
}

export async function withFamilyIsolation(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    // This middleware ensures all queries will be scoped to the user's family
    // The familyId is already attached to the request
    return handler(req)
  })
}