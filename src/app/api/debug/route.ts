import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/services/database'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    }

    // Check database connection
    let dbStatus = 'UNKNOWN'
    let adminExists = false
    let adminData = null

    try {
      // Test database connection
      await databaseService.prisma.$connect()
      dbStatus = 'CONNECTED'

      // Check if admin exists
      const admin = await databaseService.findAdminByEmail('admin@ecommerce.com')
      if (admin) {
        adminExists = true
        // Test password verification
        const testPassword = 'admin123456'
        const isValidPassword = await bcrypt.compare(testPassword, admin.passwordHash)
        
        adminData = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          hasPasswordHash: !!admin.passwordHash,
          passwordHashLength: admin.passwordHash?.length || 0,
          passwordVerificationTest: isValidPassword
        }
      }
    } catch (dbError) {
      dbStatus = `ERROR: ${dbError instanceof Error ? dbError.message : String(dbError)}`
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      database: {
        status: dbStatus,
        adminExists,
        adminData
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}