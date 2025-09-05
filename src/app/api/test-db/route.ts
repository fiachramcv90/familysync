import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    const supabase = await createServiceRoleClient();
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('families')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError.message,
        code: connectionError.code
      });
    }
    
    // Test if we can check for existing users
    const { data: userTest, error: userError } = await supabase
      .from('family_members')
      .select('email')
      .eq('email', 'test@example.com')
      .maybeSingle();
      
    if (userError) {
      console.error('User table error:', userError);
      return NextResponse.json({
        success: false,
        error: 'User table query failed',
        details: userError.message,
        code: userError.code
      });
    }
    
    // Test auth admin capabilities
    try {
      const { data: authTest, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (authError) {
        console.error('Auth admin error:', authError);
        return NextResponse.json({
          success: false,
          error: 'Auth admin failed',
          details: authError.message,
          code: authError.code
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'All tests passed',
        results: {
          connectionTest: !!connectionTest,
          userTableTest: userTest === null, // Should be null for non-existent user
          authAdminTest: !!authTest
        }
      });
      
    } catch (authError: any) {
      console.error('Auth admin exception:', authError);
      return NextResponse.json({
        success: false,
        error: 'Auth admin exception',
        details: authError.message || authError.toString()
      });
    }
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message || error.toString()
    });
  }
}