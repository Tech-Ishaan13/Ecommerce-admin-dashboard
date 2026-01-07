import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('Login attempt for:', email)
    
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
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Invalid credentials' 
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed' 
      },
      { status: 500 }
    )
  }
}