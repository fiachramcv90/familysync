import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Testing login with:', { email, passwordLength: password?.length });
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    console.log('Supabase client created, attempting signInWithPassword...');
    
    // Test sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in result:', {
      hasData: !!authData,
      hasUser: !!authData?.user,
      hasSession: !!authData?.session,
      error: authError
    });
    
    if (authError) {
      return NextResponse.json({
        success: false,
        error: authError.message,
        errorCode: authError.status,
        details: authError
      });
    }
    
    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: 'No user returned',
        authData
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      userId: authData.user.id,
      email: authData.user.email
    });
    
  } catch (error: any) {
    console.error('Debug login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      details: error.message
    });
  }
}