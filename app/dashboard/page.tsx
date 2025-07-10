import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-gray-400 mt-2">Monitor your trading performance and manage your strategies</p>
          </div>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DashboardOverview />
            <LiveMarketData />
            <PortfolioAnalytics />
          </div>

          <div className="space-y-8">
            <ActiveStrategies />
            <PnLTracking />
            <RiskManagement />
          </div>
        </div>

        <TradeLogs />
      </div>
    </ProtectedRoute>
  )
}
