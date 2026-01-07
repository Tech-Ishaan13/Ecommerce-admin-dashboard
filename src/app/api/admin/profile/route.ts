import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

async function handleUpdateProfile(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { name, email } = body
    
    if (!name || !email) {
      throw new ApiError('VALIDATION_ERROR', 'Name and email are required', 400)
    }
    
    // Check if email is already taken by another user
    const existingUser = await prisma.adminUser.findFirst({
      where: {
        email,
        id: {
          not: user.id,
        },
      },
    })
    
    if (existingUser) {
      throw new ApiError('VALIDATION_ERROR', 'Email is already taken', 400)
    }
    
    // Update user profile
    const updatedUser = await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })
    
    return createSuccessResponse(updatedUser)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to update profile', 500)
  }
}

export const PATCH = withApiMiddleware(handleUpdateProfile, {
  rateLimit: 'api',
  requireAuth: true,
})