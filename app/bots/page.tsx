import { BotsOverview } from "@/components/bots/bots-overview"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function BotsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#191A1E]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
            <p className="text-gray-400 mt-2">Automated trading strategies and bot management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <BotsOverview />
            </div>
            <div>
              <BotStrategies />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActiveBots />
            <BotPerformance />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
