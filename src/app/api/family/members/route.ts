import { NextRequest, NextResponse } from 'next/server'
import { withFamilyIsolation, AuthenticatedRequest } from '@/lib/api-middleware'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const GET = withFamilyIsolation(async (req: AuthenticatedRequest) => {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Query is automatically scoped to user's family via RLS
    // But we also explicitly filter by familyId for extra safety
    const { data: members, error } = await supabase
      .from('family_members')
      .select(`
        id,
        email,
        name,
        role,
        avatar_color,
        is_active,
        created_at,
        last_seen_at
      `)
      .eq('family_id', req.familyId!)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch family members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch family members' },
        { status: 500 }
      )
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Family members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})