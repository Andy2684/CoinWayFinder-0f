import { BotsOverview } from "@/components/bots/bots-overview"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

export default function BotsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🤖 Trading Bots</h1>
            <p className="text-gray-300">Automate your crypto trading with AI-powered strategies</p>
          </div>
          <CreateBotDialog />
        </div>

        {/* Overview Cards */}
        <BotsOverview />

        {/* Bot Strategies */}
        <BotStrategies />

        {/* Active Bots */}
        <ActiveBots />

        {/* Performance Analytics */}
        <BotPerformance />
      </div>
    </div>
  )
}
