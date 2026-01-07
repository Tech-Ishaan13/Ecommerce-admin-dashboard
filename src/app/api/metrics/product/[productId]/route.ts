import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { 
  withApiMiddleware, 
  createSuccessResponse, 
  ApiError 
} from '@/lib/api-middleware'
import { metricsService } from '@/services/metrics'
import { DateRange } from '@/types'

async function handleGetProductMetrics(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(request)
    
    const { productId } = params
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

    const productPerformance = await metricsService.getProductPerformance(productId, dateRange)

    return createSuccessResponse(productPerformance)
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found', 404)
    }
    
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch product performance metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetProductMetrics, {
  rateLimit: 'api',
  requireAuth: false, // Temporarily disable auth
})