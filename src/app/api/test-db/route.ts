import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    const adminCount = await prisma.adminUser.count()
    const productCount = await prisma.product.count()
    const salesCount = await prisma.salesData.count()
    
    return NextResponse.json({
      success: true,
      data: {
        adminCount,
        productCount,
        salesCount,
        message: 'Database connection successful'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 })
  }
}