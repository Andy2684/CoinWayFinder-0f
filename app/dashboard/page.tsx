"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { ApiAccess } from "@/components/dashboard/api-access"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Bot, DollarSign, BarChart3 } from "lucide-react"
import { DashboardErrorBoundary } from "@/components/error-boundaries/dashboard-error-boundary"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your trading performance and manage your portfolio</p>
        </div>
        <DashboardOverview />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Portfolio</p>
                  <p className="text-2xl font-bold text-white">$12,847.32</p>
                </div>
                <DollarSign className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Bots</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">24h P&L</p>
                  <p className="text-2xl font-bold text-green-400">+$234.56</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-white">73.2%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger value="bots" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              Active Bots
            </TabsTrigger>
            <TabsTrigger value="pnl" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              P&L Tracking
            </TabsTrigger>
            <TabsTrigger
              value="trades"
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              Trade Logs
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
            >
              Market Data
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              API Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview content remains the same */}
          </TabsContent>

          <TabsContent value="bots" className="space-y-6">
            <ActiveStrategies />
          </TabsContent>

          <TabsContent value="pnl" className="space-y-6">
            <PnLTracking />
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <TradeLogs />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <LiveMarketData />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <ApiAccess />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardErrorBoundary>
  )
}
