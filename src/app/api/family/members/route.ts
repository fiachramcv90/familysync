import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's family membership
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'No family membership found' },
        { status: 403 }
      )
    }
    
    // Query family members
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
        updated_at,
        last_seen_at
      `)
      .eq('family_id', member.family_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Family members query error:', error)
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
}