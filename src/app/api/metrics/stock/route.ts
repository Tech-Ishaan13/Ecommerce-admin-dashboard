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
    // Direct database connection - bypass service layer
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Get total products count
      const totalProducts = await prisma.product.count()
      
      // Get low stock products (stock < 10)
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lt: 10 }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          category: true,
          price: true,
          status: true,
          images: true,
          description: true,
          specifications: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { stock: 'asc' },
        take: 10
      })
      
      // Get stock by category
      const stockByCategory = await prisma.product.groupBy({
        by: ['category'],
        _sum: { stock: true },
        _count: { id: true },
        orderBy: { _sum: { stock: 'desc' } }
      })
      
      const stockMetrics = {
        totalProducts,
        lowStockProducts: lowStockProducts.map(product => ({
          ...product,
          lowStockThreshold: 10 // Default threshold
        })),
        stockByCategory: stockByCategory.map(category => ({
          category: category.category,
          totalStock: category._sum.stock || 0,
          productCount: category._count.id
        }))
      }
      
      await prisma.$disconnect()
      return createSuccessResponse(stockMetrics)
      
    } catch (dbError) {
      await prisma.$disconnect()
      throw dbError
    }
    
  } catch (error) {
    console.error('Stock metrics error:', error)
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch stock metrics', 500)
  }
}

export const GET = withApiMiddleware(handleGetStockMetrics, {
  rateLimit: 'api',
  requireAuth: false, // Temporarily disable auth
})