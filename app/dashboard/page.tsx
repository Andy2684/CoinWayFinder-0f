"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { APIAccess } from "@/components/dashboard/api-access"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">Monitor your bots, trades, and market performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="overview"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              Active Bots
            </TabsTrigger>
            <TabsTrigger
              value="pnl"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              P&L Tracking
            </TabsTrigger>
            <TabsTrigger
              value="trades"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              Trade Logs
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              Market Data
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
            >
              API Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="bots" className="mt-6">
            <ActiveBots />
          </TabsContent>

          <TabsContent value="pnl" className="mt-6">
            <PnLTracking />
          </TabsContent>

          <TabsContent value="trades" className="mt-6">
            <TradeLogs />
          </TabsContent>

          <TabsContent value="market" className="mt-6">
            <LiveMarketData />
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <APIAccess />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
