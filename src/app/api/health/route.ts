import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

/**
 * Health check endpoint for CI/CD pipeline verification
 * Tests critical system components including database connectivity
 */
export async function GET() {
  try {
    // Check database connectivity
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from('families')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('Database health check failed:', error)
      return NextResponse.json(
        { 
          status: 'unhealthy',
          error: 'Database connectivity issue',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // System is healthy
    return NextResponse.json({
      status: 'healthy',
      services: {
        database: 'connected',
        authentication: 'ready',
        api: 'operational'
      },
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}