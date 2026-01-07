import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'
import { authService } from '@/services/auth'

export const dynamic = 'force-dynamic'

async function handleCreateAdmin(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'admin' | 'super_admin'

    if (!email || !password || !name) {
      throw new ApiError('VALIDATION_ERROR', 'All fields are required', 400)
    }

    // Check if this is the first admin (no authentication required for first admin)
    const { databaseService } = await import('@/services/database')
    const existingAdmins = await databaseService.prisma.adminUser.count()
    
    let currentUser = null
    
    if (existingAdmins > 0) {
      // If admins exist, require authentication and super admin role
      currentUser = await requireAuth(request)
      
      if (currentUser.role !== 'super_admin') {
        throw new ApiError('FORBIDDEN', 'Super admin access required', 403)
      }
    } else {
      // First admin - no authentication required, but make them super_admin
      console.log('Creating first admin user - no authentication required')
    }

    // Validate password strength
    const passwordValidation = authService.validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new ApiError('VALIDATION_ERROR', passwordValidation.errors.join(', '), 400)
    }

    const adminData = {
      email,
      password,
      name,
      role: existingAdmins === 0 ? 'super_admin' : (role || 'admin') // First admin is always super_admin
    }

    // For first admin, create a mock current user
    const mockCurrentUser = existingAdmins === 0 ? { role: 'super_admin' } : currentUser

    const newAdmin = await authService.createAdmin(adminData, mockCurrentUser as any)
    
    return createSuccessResponse(newAdmin)
    
  } catch (error) {
    console.error('Admin creation error:', error)
    
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to create admin user', 500)
  }
}

export const POST = withApiMiddleware(handleCreateAdmin, {
  rateLimit: 'strict',
  requireAuth: false, // We handle auth manually inside the function
})