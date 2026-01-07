import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'
import { metricsService } from '@/services/metrics'
import { DateRange } from '@/types'

export const dynamic = 'force-dynamic'

async function handleGetSalesMetrics(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateRange: DateRange | undefined
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      }
    }

    const salesMetrics = await metricsService.getSalesMetrics(dateRange)

    return createSuccessResponse(salesMetrics)
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch sales metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetSalesMetrics, {
  rateLimit: 'api',
  requireAuth: true,
})