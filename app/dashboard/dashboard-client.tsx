"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"
import { LiveMarketTicker } from "@/components/dashboard/live-market-ticker"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"

export default function DashboardClient() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DashboardSidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-300">
                Welcome back, {user.firstName}! Here's your trading overview.
              </p>
            </div>

            <div className="space-y-8">
              {/* Market Data Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveMarketTicker />
                <PortfolioOverview />
              </div>

              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <DashboardOverview />
                  <ActiveStrategies />
                  <PnLTracking />
                </div>
                <div className="space-y-6">
                  <QuickActions />
                  <PortfolioAnalytics />
                  <RiskManagement />
                </div>
              </div>

              {/* Real-time Data Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealtimeOrderBook />
                <RealtimeTradeFeed />
              </div>

              {/* Trade Logs */}
              <TradeLogs />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
