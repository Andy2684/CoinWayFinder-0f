"use client"

import { useEffect } from "react"
import DashboardOverview from "@/components/dashboard/dashboard-overview"
import PortfolioAnalytics from "@/components/dashboard/portfolio-analytics"
import ActiveStrategies from "@/components/dashboard/active-strategies"
import PnLTracking from "@/components/dashboard/pnl-tracking"
import TradeLogs from "@/components/dashboard/trade-logs"
import QuickActions from "@/components/dashboard/quick-actions"
import RiskManagement from "@/components/dashboard/risk-management"
import LiveMarketData from "@/components/dashboard/live-market-data"
import ProtectedRoute from "@/components/auth/protected-route"

export default function DashboardPage() {
  useEffect(() => {
    // Add dashboard background class
    document.body.classList.add("dashboard-page-bg")

    return () => {
      document.body.classList.remove("dashboard-page-bg")
    }
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen dashboard-page-bg transition-colors duration-500">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Trading Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your trading.</p>
              </div>
              <QuickActions />
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-6">
                <DashboardOverview />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PortfolioAnalytics />
                  <PnLTracking />
                </div>
                <TradeLogs />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 space-y-6">
                <LiveMarketData />
                <ActiveStrategies />
                <RiskManagement />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
