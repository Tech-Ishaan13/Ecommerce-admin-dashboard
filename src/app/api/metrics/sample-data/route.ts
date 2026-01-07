import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'
import { metricsService } from '@/services/metrics'

export const dynamic = 'force-dynamic'

async function handleCreateSampleData(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    await metricsService.createSampleSalesData()

    return createSuccessResponse({ message: 'Sample sales data created successfully' })
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to create sample sales data', 500)
  }
}

export const POST = withApiMiddleware(handleCreateSampleData, {
  rateLimit: 'api',
  requireAuth: true,
})