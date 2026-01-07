import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'
import { metricsService } from '@/services/metrics'

export const dynamic = 'force-dynamic'

async function handleGetStockMetrics(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    const stockMetrics = await metricsService.getStockMetrics()

    return createSuccessResponse(stockMetrics)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch stock metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetStockMetrics, {
  rateLimit: 'api',
  requireAuth: true,
})