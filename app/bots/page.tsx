
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

export default function BotsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
            <p className="text-gray-400 mt-2">Automated trading strategies and bot management</p>
          </div>
          <CreateBotDialog />
        </div>

        <BotsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ActiveBots />
            <BotStrategies />
          </div>

          <div>
            <BotPerformance />
          </div>
        </div>
      </div>
    </ProtectedRoute>

'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useEffect } from 'react'

export default function BotsPage() {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated — redirect or hide bots')
    }
  }, [isAuthenticated])

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">My Bots</h1>
      {/* TODO: здесь будет список ботов */}
    </div>

  )
}
