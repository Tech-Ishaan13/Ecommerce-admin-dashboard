import { NextResponse } from 'next/server'
import { metricsService } from '@/services/metrics'
import { requireAuth } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Verify authentication
    await requireAuth()
    
    // Generate sample sales data for existing products
    await metricsService.createSampleSalesData()

    return NextResponse.json({
      success: true,
      message: 'Sample sales data created successfully. Dashboard will now show real metrics.',
    })
  } catch (error) {
    console.error('Initialize sample data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INIT_SAMPLE_DATA_ERROR',
          message: 'Failed to initialize sample data',
        },
      },
      { status: 500 }
    )
  }
}