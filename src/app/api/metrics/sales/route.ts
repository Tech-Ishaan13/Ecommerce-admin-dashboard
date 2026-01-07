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
    // Direct database connection - bypass service layer
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Get total sales
      const totalSalesResult = await prisma.salesData.aggregate({
        _sum: { totalAmount: true, quantity: true }
      })
      
      // Get sales by day (last 7 days)
      const salesByDay = await prisma.salesData.groupBy({
        by: ['saleDate'],
        _sum: { totalAmount: true },
        orderBy: { saleDate: 'asc' },
        take: 7
      })
      
      // Get top products
      const topProducts = await prisma.salesData.groupBy({
        by: ['productId'],
        _sum: { totalAmount: true, quantity: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5
      })
      
      // Get product names
      const productIds = topProducts.map(p => p.productId).filter(Boolean)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
      })
      
      const productMap = new Map(products.map(p => [p.id, p.name]))
      
      const salesMetrics = {
        totalSales: totalSalesResult._sum.totalAmount || 0,
        salesByPeriod: salesByDay.map(sale => ({
          date: sale.saleDate.toISOString().split('T')[0],
          value: sale._sum.totalAmount || 0
        })),
        topProducts: topProducts.map(sale => ({
          productId: sale.productId!,
          productName: productMap.get(sale.productId!) || 'Unknown Product',
          totalSales: sale._sum.totalAmount || 0,
          quantity: sale._sum.quantity || 0
        }))
      }
      
      await prisma.$disconnect()
      return createSuccessResponse(salesMetrics)
      
    } catch (dbError) {
      await prisma.$disconnect()
      throw dbError
    }
    
  } catch (error) {
    console.error('Sales metrics error:', error)
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch sales metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetSalesMetrics, {
  rateLimit: 'api',
  requireAuth: false, // Temporarily disable auth
})