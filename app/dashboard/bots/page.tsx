"use client"

import { useState } from "react"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

export default function BotsPage() {
  const [bots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      strategy: "Scalping",
      status: "active",
      profit: 2345.67,
      profitPercent: 12.3,
      trades: 156,
      winRate: 73.2,
      pair: "BTC/USDT",
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      strategy: "Grid Trading",
      status: "active",
      profit: 1234.56,
      profitPercent: 8.7,
      trades: 89,
      winRate: 68.5,
      pair: "ETH/USDT",
    },
    {
      id: 3,
      name: "DCA Strategy",
      strategy: "DCA",
      status: "paused",
      profit: 987.43,
      profitPercent: 5.2,
      trades: 45,
      winRate: 82.1,
      pair: "ADA/USDT",
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
          <p className="text-gray-400">Manage your automated trading strategies</p>
        </div>
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <CreateBotDialog />
        </div>
      </div>

      <BotsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveBots bots={bots.filter((bot) => bot.status === "active")} />
        <BotPerformance bots={bots} />
      </div>

      <BotStrategies bots={bots} />
    </div>
  )
}
