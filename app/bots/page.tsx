"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots" // ✅ именованный импорт
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

export default function BotsPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <BotsOverview />
        <ActiveBots />
        <BotPerformance />
        <BotStrategies />
        <CreateBotDialog />
      </div>
    </ProtectedRoute>
  )
}
