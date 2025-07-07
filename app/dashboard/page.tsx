import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Trading Dashboard</h1>
          <p className="text-gray-300">
            Monitor your strategies, trades, and portfolio performance across all exchanges
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Overview Cards */}
        <DashboardOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Strategies & Market Data */}
          <div className="lg:col-span-2 space-y-8">
            <ActiveStrategies />
            <LiveMarketData />
          </div>

          {/* Right Column - PnL & Logs */}
          <div className="space-y-8">
            <PnLTracking />
            <TradeLogs />
          </div>
        </div>
      </div>
    </div>
  )
}
