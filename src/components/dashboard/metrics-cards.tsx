import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesMetrics, StockMetrics } from '@/types'
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react'

interface MetricsCardsProps {
  salesMetrics?: SalesMetrics
  stockMetrics?: StockMetrics
  isLoading: boolean
}

export function MetricsCards({ salesMetrics, stockMetrics, isLoading }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const calculateSalesGrowth = () => {
    if (!salesMetrics?.salesByPeriod || salesMetrics.salesByPeriod.length < 2) {
      return 0
    }
    
    const recent = salesMetrics.salesByPeriod.slice(-7) // Last 7 days
    const previous = salesMetrics.salesByPeriod.slice(-14, -7) // Previous 7 days
    
    const recentTotal = recent.reduce((sum, day) => sum + day.value, 0)
    const previousTotal = previous.reduce((sum, day) => sum + day.value, 0)
    
    if (previousTotal === 0) return 0
    return ((recentTotal - previousTotal) / previousTotal) * 100
  }

  const salesGrowth = calculateSalesGrowth()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatCurrency(salesMetrics?.totalSales || 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}% from last week
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              stockMetrics?.totalProducts || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Active and inactive products
          </p>
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className={stockMetrics?.lowStockProducts.length ? 'text-red-600' : 'text-green-600'}>
                {stockMetrics?.lowStockProducts.length || 0}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Products below threshold
          </p>
        </CardContent>
      </Card>

      {/* Top Product Sales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Product</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatCurrency(salesMetrics?.topProducts[0]?.totalSales || 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              salesMetrics?.topProducts[0]?.productName || 'No sales data'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}