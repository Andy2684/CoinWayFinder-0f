"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

export default function DashboardBotsClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bots, setBots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      status: "active",
      profit: 1234.56,
      trades: 45,
      winRate: 78.5,
      strategy: "Grid Trading",
      pair: "BTC/USDT",
      isActive: true,
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      status: "active",
      profit: 856.23,
      trades: 32,
      winRate: 82.1,
      strategy: "DCA",
      pair: "ETH/USDT",
      isActive: true,
    },
    {
      id: 3,
      name: "Altcoin Hunter",
      status: "paused",
      profit: 423.78,
      trades: 18,
      winRate: 65.4,
      strategy: "Momentum",
      pair: "ADA/USDT",
      isActive: false,
    },
    {
      id: 4,
      name: "SOL Swing Trader",
      status: "active",
      profit: 678.9,
      trades: 28,
      winRate: 75.2,
      strategy: "Swing Trading",
      pair: "SOL/USDT",
      isActive: true,
    },
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const toggleBot = (id: number) => {
    setBots(
      bots.map((bot) =>
        bot.id === id ? { ...bot, isActive: !bot.isActive, status: bot.isActive ? "paused" : "active" } : bot,
      ),
    )
  }

  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0)
  const activeBots = bots.filter((bot) => bot.isActive).length
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0)
  const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length

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
              <h1 className="text-2xl font-bold text-white">Trading Bots</h1>
              <p className="mt-2 text-sm text-gray-300">Manage and monitor your automated trading bots</p>
            </div>

            <div className="space-y-8">
              <BotsOverview
                totalProfit={totalProfit}
                activeBots={activeBots}
                totalTrades={totalTrades}
                avgWinRate={avgWinRate}
              />
              <ActiveBots bots={bots} toggleBot={toggleBot} />
              <BotPerformance bots={bots} />
              <BotStrategies bots={bots} />
            </div>

            <CreateBotDialog />
          </div>
        </main>
      </div>
    </div>
  )
}
