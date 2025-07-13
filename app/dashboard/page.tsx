import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"

// New Chart Components
import { LivePriceChart } from "@/components/charts/live-price-chart"
import { VolumeChart } from "@/components/charts/volume-chart"
import { PortfolioPerformanceChart } from "@/components/charts/portfolio-performance-chart"
import { MarketHeatmap } from "@/components/charts/market-heatmap"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Monitor your trading performance and manage your strategies with advanced analytics
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Main Overview */}
        <DashboardOverview />

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <LivePriceChart symbol="BTC/USDT" height={350} />
          <VolumeChart />
        </div>

        {/* Performance and Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <PortfolioPerformanceChart />
          </div>
          <div className="space-y-6">
            <PnLTracking />
            <RiskManagement />
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <MarketHeatmap />
          </div>
          <div>
            <LiveMarketData />
          </div>
        </div>

        {/* Portfolio and Strategies */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <PortfolioAnalytics />
          </div>
          <div>
            <ActiveStrategies />
          </div>
        </div>

        {/* Trade Logs */}
        <TradeLogs />
      </div>
    </ProtectedRoute>
  )
}
