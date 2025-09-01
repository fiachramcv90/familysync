import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { validatePassword } from '@/lib/validation'

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FECA57', '#48C9B0', '#F368E0', '#FFA502'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, familyName } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createServiceRoleClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('family_members')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Select random avatar color
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    // Create family if familyName is provided
    let familyId: string
    if (familyName) {
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName })
        .select('id')
        .single()

      if (familyError) {
        // Cleanup: Delete the auth user if family creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.error('Family creation error:', familyError)
        return NextResponse.json(
          { error: 'Failed to create family' },
          { status: 500 }
        )
      }
      familyId = familyData.id
    } else {
      // Create a default family with user's name
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({ name: `${name}'s Family` })
        .select('id')
        .single()

      if (familyError) {
        // Cleanup: Delete the auth user if family creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        console.error('Family creation error:', familyError)
        return NextResponse.json(
          { error: 'Failed to create family' },
          { status: 500 }
        )
      }
      familyId = familyData.id
    }

    // Create family member profile
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        user_id: authData.user.id,
        family_id: familyId,
        email,
        name,
        role: 'admin', // First member is admin
        avatar_color: avatarColor,
      })

    if (memberError) {
      // Cleanup: Delete the auth user and family if member creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      await supabase.from('families').delete().eq('id', familyId)
      console.error('Member creation error:', memberError)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}