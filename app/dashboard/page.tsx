import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { LiveCryptoPrices } from "@/components/dashboard/live-crypto-prices"
import { WhaleAlerts } from "@/components/dashboard/whale-alerts"
import { CryptoNewsFeed } from "@/components/dashboard/crypto-news-feed"
import { MarketTrends } from "@/components/dashboard/market-trends"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
            <p className="text-gray-400">Monitor your crypto portfolio and market trends in real-time</p>
          </div>
        </div>

        {/* Overview Stats */}
        <DashboardOverview />

        {/* Real-Time Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveCryptoPrices />
          <WhaleAlerts />
        </div>

        {/* News and Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CryptoNewsFeed />
          <MarketTrends />
        </div>

        {/* Additional Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions />
          <ActiveStrategies />
          <div className="lg:col-span-1">
            <LiveMarketData />
          </div>
        </div>

        {/* Trading Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradeLogs />
          <PnLTracking />
        </div>
      </div>
    </div>
  )
}
