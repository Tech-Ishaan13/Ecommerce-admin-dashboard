import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

async function handleGetCurrentUser(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    return createSuccessResponse(user)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to get current user', 500)
  }
}

export const GET = withApiMiddleware(handleGetCurrentUser, {
  rateLimit: 'api',
  requireAuth: true,
})