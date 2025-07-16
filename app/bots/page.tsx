// File: app/bots/page.tsx
import React from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import BotsOverview from '@/components/bots/bots-overview'
import { ActiveBots } from '@/components/bots/active-bots'
import { BotPerformance } from '@/components/bots/bot-performance'
import { BotStrategies } from '@/components/bots/bot-strategies'

export default function BotsPage() {
  const stats = [
    { title: 'Total Bots', value: 12, change: 5, changeType: 'positive' as const },
    { title: 'Active Bots', value: 8, change: -2, changeType: 'negative' as const },
    { title: 'Pending Jobs', value: 4, change: 0, changeType: 'neutral' as const },
  ]

  const bots = [
    { id: 'bot-1', name: 'DCA Scalper', status: 'running', lastRun: '2025-07-15T18:00:00Z' },
    { id: 'bot-2', name: 'Arbitrage Pro', status: 'stopped', lastRun: '2025-07-14T22:30:00Z' },
  ]

  const performanceData = [
    { date: '2025-07-14', performance: 4.5 },
    { date: '2025-07-15', performance: -1.2 },
  ]

  const strategiesList = [
    { name: 'DCA', enabled: true },
    { name: 'Scalping', enabled: false },
    { name: 'Grid', enabled: true },
  ]

  return (
    <ProtectedRoute requiredRole="user">
      <div className="space-y-8 p-6">
        <BotsOverview stats={stats} />

        <ActiveBots bots={bots} />

        <BotPerformance data={performanceData} />

        <BotStrategies strategies={strategiesList} />
      </div>
    </ProtectedRoute>
  )
}
