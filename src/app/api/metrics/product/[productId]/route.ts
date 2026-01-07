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
    const { productId } = params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Direct database connection - bypass service layer
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, stock: true }
      })
      
      if (!product) {
        throw new ApiError('PRODUCT_NOT_FOUND', 'Product not found', 404)
      }
      
      // Build date filter
      let dateFilter = {}
      if (startDate && endDate) {
        dateFilter = {
          saleDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      }
      
      // Get sales data for this product
      const salesData = await prisma.salesData.findMany({
        where: {
          productId: productId,
          ...dateFilter
        },
        orderBy: { saleDate: 'asc' }
      })
      
      // Calculate metrics
      const totalSales = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
      const totalQuantity = salesData.reduce((sum, sale) => sum + (sale.quantity || 0), 0)
      
      // Group sales by date
      const salesByDate = salesData.reduce((acc, sale) => {
        const date = sale.saleDate.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { date, sales: 0, quantity: 0 }
        }
        acc[date].sales += sale.totalAmount || 0
        acc[date].quantity += sale.quantity || 0
        return acc
      }, {} as Record<string, { date: string, sales: number, quantity: number }>)
      
      const productPerformance = {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          currentStock: product.stock
        },
        metrics: {
          totalSales,
          totalQuantitySold: totalQuantity,
          averageOrderValue: totalQuantity > 0 ? totalSales / totalQuantity : 0,
          salesCount: salesData.length
        },
        salesHistory: Object.values(salesByDate),
        dateRange: startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
        } : undefined
      }
      
      await prisma.$disconnect()
      return createSuccessResponse(productPerformance)
      
    } catch (dbError) {
      await prisma.$disconnect()
      throw dbError
    }
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    console.error('Product metrics error:', error)
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch product performance metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetProductMetrics, {
  rateLimit: 'api',
  requireAuth: false, // Temporarily disable auth
})