import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Refresh error:', error)
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session to refresh' },
        { status: 401 }
      )
    }

    // Update session cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('family_members')
      .select(`
        id,
        family_id,
        email,
        name,
        role,
        avatar_color,
        families (
          id,
          name
        )
      `)
      .eq('user_id', data.user!.id)
      .single()

    return NextResponse.json(
      {
        message: 'Session refreshed successfully',
        user: {
          id: data.user!.id,
          email: data.user!.email,
          ...profile
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // GET method to check if session needs refresh
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return NextResponse.json(
        { needsRefresh: true },
        { status: 200 }
      )
    }

    // Check if session expires within 5 minutes
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
    
    return NextResponse.json(
      { 
        needsRefresh: expiresAt < fiveMinutesFromNow,
        expiresAt: expiresAt
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { needsRefresh: true },
      { status: 200 }
    )
  }
}