import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

async function handleUpdatePassword(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    const body = await request.json()
    const { currentPassword, newPassword } = body
    
    if (!currentPassword || !newPassword) {
      throw new ApiError('VALIDATION_ERROR', 'Current password and new password are required', 400)
    }
    
    if (newPassword.length < 8) {
      throw new ApiError('VALIDATION_ERROR', 'New password must be at least 8 characters long', 400)
    }
    
    // Get current user with password hash
    const currentUser = await prisma.adminUser.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    })
    
    if (!currentUser) {
      throw new ApiError('NOT_FOUND', 'User not found', 404)
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.passwordHash)
    
    if (!isCurrentPasswordValid) {
      throw new ApiError('VALIDATION_ERROR', 'Current password is incorrect', 400)
    }
    
    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)
    
    // Update password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    })
    
    return createSuccessResponse({ message: 'Password updated successfully' })
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to update password', 500)
  }
}

export const PATCH = withApiMiddleware(handleUpdatePassword, {
  rateLimit: 'strict', // Use strict rate limiting for password changes
  requireAuth: true,
})