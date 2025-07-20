"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { RealtimeMarketTicker } from "@/components/dashboard/realtime-market-ticker"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"
import { TrendingUp, DollarSign, Activity, Users, ArrowUpRight } from "lucide-react"

export default function DashboardPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's your trading overview.</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +20.1%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$1,234.56</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5.2%
                  </span>
                  vs yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Market Data */}
          <div className="grid gap-4 md:grid-cols-2">
            <RealtimeMarketTicker />
            <LiveMarketData />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="pnl">P&L</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <DashboardOverview />
                <PortfolioAnalytics />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <RealtimeOrderBook />
                <RealtimeTradeFeed />
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              <PortfolioOverview />
            </TabsContent>

            <TabsContent value="strategies">
              <ActiveStrategies />
            </TabsContent>

            <TabsContent value="pnl">
              <PnLTracking />
            </TabsContent>

            <TabsContent value="trades">
              <TradeLogs />
            </TabsContent>

            <TabsContent value="risk">
              <RiskManagement />
            </TabsContent>
          </Tabs>

          <FloatingDashboardButton />
        </div>
      </div>
    </div>
  )
}
