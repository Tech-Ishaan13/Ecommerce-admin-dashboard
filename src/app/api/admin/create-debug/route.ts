import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Debug: Admin creation started')
    
    // Test 1: Can we read form data?
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    
    console.log('Debug: Form data received', { email, name, hasPassword: !!password })
    
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        debug: { email: !!email, password: !!password, name: !!name }
      }, { status: 400 })
    }
    
    // Test 2: Can we connect to database?
    try {
      const { databaseService } = await import('@/services/database')
      console.log('Debug: Database service imported')
      
      const adminCount = await databaseService.prisma.adminUser.count()
      console.log('Debug: Admin count:', adminCount)
      
      return NextResponse.json({
        success: true,
        debug: {
          message: 'Debug successful',
          adminCount,
          formData: { email, name }
        }
      })
      
    } catch (dbError) {
      console.error('Debug: Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        debug: {
          error: dbError instanceof Error ? dbError.message : String(dbError)
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Debug: General error:', error)
    return NextResponse.json({
      success: false,
      error: 'General error',
      debug: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}