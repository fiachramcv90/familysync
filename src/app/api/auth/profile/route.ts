import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile from family_members
    const { data: profile, error: profileError } = await supabase
      .from('family_members')
      .select(`
        id,
        family_id,
        email,
        name,
        role,
        avatar_color,
        is_active,
        created_at,
        updated_at,
        last_seen_at,
        families (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { name, email } = body

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    if (!name && !email) {
      return NextResponse.json(
        { error: 'Name or email must be provided' },
        { status: 400 }
      )
    }

    // If email is being updated, validate format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email is already taken
      const { data: existingUser } = await supabase
        .from('family_members')
        .select('id')
        .eq('email', email)
        .neq('user_id', user.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }

      // Update email in auth
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: email
      })

      if (authUpdateError) {
        console.error('Auth update error:', authUpdateError)
        return NextResponse.json(
          { error: 'Failed to update email' },
          { status: 500 }
        )
      }
    }

    // Build update object
    const updates: any = {}
    if (name) updates.name = name
    if (email) updates.email = email
    updates.updated_at = new Date().toISOString()

    // Update user profile
    const { data: profile, error: updateError } = await supabase
      .from('family_members')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}