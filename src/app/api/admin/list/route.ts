import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

async function handleListAdmins(request: NextRequest) {
  try {
    // Verify authentication and require super admin
    const user = await requireAuth(request)
    
    if (user.role !== 'super_admin') {
      throw new ApiError('FORBIDDEN', 'Super admin access required', 403)
    }
    
    // Fetch all admin users
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return createSuccessResponse(adminUsers)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch admin users', 500)
  }
}

export const GET = withApiMiddleware(handleListAdmins, {
  rateLimit: 'api',
  requireAuth: true,
})