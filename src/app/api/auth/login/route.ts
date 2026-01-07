import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('Login attempt for:', email)
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
    })
    
    const result = await authService.login({ email, password })
    console.log('Login result:', { success: result.success, error: result.error })

    if (result.success && result.token) {
      const response = NextResponse.json({
        success: true,
        user: result.user,
        message: 'Login successful'
      })

      // Set secure cookie
      response.cookies.set('admin-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response
    } else {
      console.error('Login failed with result:', result)
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'UNAUTHORIZED',
            message: result.error || 'Authentication required'
          },
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}