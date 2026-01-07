'use client'

import { useState } from 'react'
import { SalesChart } from './sales-chart'
import { StockOverview } from './stock-overview'
import { TopProducts } from './top-products'
import { MetricsCards } from './metrics-cards'
import { CategoryStockChart } from './category-stock-chart'
import { SetupBanner } from './setup-banner'
import { useDashboardMetrics } from '@/hooks/use-metrics'

export function DashboardContent() {
  const [mounted, setMounted] = useState(false)
  
  // Use real metrics data instead of mock data
  const { sales, stock, isLoading, isError, error } = useDashboardMetrics()

  // Check if we have real data (Cloudinary config will be checked server-side)
  const hasData = sales.data && (sales.data.totalSales > 0 || sales.data.topProducts.length > 0)

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    // Set mounted after first render
    setTimeout(() => setMounted(true), 0)
    
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 h-80 bg-gray-200 rounded-lg animate-pulse" />
          <div className="col-span-3 h-80 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  // Show error state if data fetching failed
  if (isError && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Failed to load dashboard data</h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.message || 'Unable to fetch dashboard metrics. Please try refreshing the page.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Setup Banner - shows if data is missing */}
      <SetupBanner 
        hasData={hasData || false} 
      />

      {/* Metrics Cards */}
      <MetricsCards 
        salesMetrics={sales.data} 
        stockMetrics={stock.data}
        isLoading={isLoading}
      />

      {/* Main Dashboard Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Column - Sales Chart and Top Products */}
        <div className="col-span-4 space-y-4">
          <SalesChart 
            data={sales.data?.salesByPeriod || []}
            isLoading={isLoading}
          />
          
          <TopProducts 
            data={sales.data?.topProducts || []}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Stock Components */}
        <div className="col-span-3 space-y-4">
          <StockOverview 
            data={stock.data}
            isLoading={isLoading}
          />
          
          <CategoryStockChart 
            data={stock.data?.stockByCategory || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}