"use client"

import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotsOverview } from "@/components/bots/bots-overview"
import { BotStrategies } from "@/components/bots/bot-strategies"

export default function BotsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🤖 Trading Bots</h1>
          <p className="text-xl text-gray-300">Automate your crypto trading with intelligent bots</p>
        </div>

        <BotsOverview />
        <ActiveBots />
        <BotPerformance />
        <BotStrategies />
      </div>
    </div>
  )
}
