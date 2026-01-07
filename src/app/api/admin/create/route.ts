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
    // Verify authentication and require super admin
    const user = await requireAuth(request)
    
    if (user.role !== 'super_admin') {
      throw new ApiError('FORBIDDEN', 'Super admin access required', 403)
    }
    
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'admin' | 'super_admin'

    if (!email || !password || !name) {
      throw new ApiError('VALIDATION_ERROR', 'All fields are required', 400)
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
      role: role || 'admin'
    }

    const newAdmin = await authService.createAdmin(adminData, user)
    
    return createSuccessResponse(newAdmin)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to create admin user', 500)
  }
}

export const POST = withApiMiddleware(handleCreateAdmin, {
  rateLimit: 'strict',
  requireAuth: true,
})