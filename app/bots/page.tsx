import { ProtectedRoute } from "@/components/auth/protected-route"
import { BotsOverview } from "@/components/bots/bots-overview"
import { AIActiveBots } from "@/components/bots/ai-active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { AIBotCreator } from "@/components/bots/ai-bot-creator"

export default function BotsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Trading Bots</h1>
            <p className="text-gray-400 mt-2">Advanced AI-powered automated trading strategies</p>
          </div>
          <AIBotCreator />
        </div>

        <BotsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AIActiveBots />
            <BotStrategies />
          </div>

          <div>
            <BotPerformance />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
