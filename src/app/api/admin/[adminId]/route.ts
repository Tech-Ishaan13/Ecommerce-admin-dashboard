import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

async function handleDeleteAdmin(request: NextRequest, { params }: { params: { adminId: string } }) {
  try {
    // Verify authentication and require super admin
    const user = await requireAuth(request)
    
    if (user.role !== 'super_admin') {
      throw new ApiError('FORBIDDEN', 'Super admin access required', 403)
    }
    
    const { adminId } = params
    
    // Prevent self-deletion
    if (adminId === user.id) {
      throw new ApiError('BAD_REQUEST', 'Cannot delete your own account', 400)
    }
    
    // Check if admin exists
    const adminToDelete = await prisma.adminUser.findUnique({
      where: { id: adminId },
    })
    
    if (!adminToDelete) {
      throw new ApiError('NOT_FOUND', 'Admin user not found', 404)
    }
    
    // Delete the admin user
    await prisma.adminUser.delete({
      where: { id: adminId },
    })
    
    return createSuccessResponse({ message: 'Admin user deleted successfully' })
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to delete admin user', 500)
  }
}

export const DELETE = withApiMiddleware(handleDeleteAdmin, {
  rateLimit: 'api',
  requireAuth: true,
})