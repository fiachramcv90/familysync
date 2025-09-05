import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { validatePassword } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, familyName } = body;
    
    console.log('Starting registration test for:', email);

    // Step 1: Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields', step: 1 });
    }

    // Step 2: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format', step: 2 });
    }

    // Step 3: Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ 
        error: passwordValidation.errors.join(', '), 
        step: 3 
      });
    }

    // Step 4: Create Supabase client
    console.log('Creating Supabase client...');
    const supabase = await createServiceRoleClient();

    // Step 5: Check if email already exists
    console.log('Checking for existing user...');
    const { data: existingUser, error: existingUserError } = await supabase
      .from('family_members')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is what we want
      console.error('Error checking existing user:', existingUserError);
      return NextResponse.json({ 
        error: 'Database error checking existing user', 
        details: existingUserError.message,
        step: 5 
      });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered', step: 5 });
    }

    // Step 6: Create auth user
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        error: 'Failed to create auth user', 
        details: authError.message,
        step: 6 
      });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'No user returned from auth', step: 6 });
    }

    console.log('Auth user created:', authData.user.id);

    // Step 7: Create family
    console.log('Creating family...');
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({ name: familyName || `${name}'s Family` })
      .select('id')
      .single();

    if (familyError) {
      console.error('Family creation error:', familyError);
      // Cleanup auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ 
        error: 'Failed to create family', 
        details: familyError.message,
        step: 7 
      });
    }

    console.log('Family created:', familyData.id);

    // Step 8: Create family member
    console.log('Creating family member...');
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        user_id: authData.user.id,
        family_id: familyData.id,
        email,
        name,
        role: 'admin',
        avatar_color: '#4ECDC4'
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Cleanup
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('families').delete().eq('id', familyData.id);
      return NextResponse.json({ 
        error: 'Failed to create family member', 
        details: memberError.message,
        step: 8 
      });
    }

    console.log('Registration completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: { id: authData.user.id, email, name }
    });

  } catch (error: any) {
    console.error('Registration test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error.message || error.toString()
    });
  }
}