import type { Metadata } from "next"
import { AIBotDashboard } from "@/components/ai-bots/ai-bot-dashboard"

export const metadata: Metadata = {
  title: "AI Trading Bots | CoinWayFinder",
  description: "Advanced AI-powered trading bots with machine learning algorithms",
}

export default function AIBotsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          AI Trading Bots
        </h1>
        <p className="text-muted-foreground">
          Deploy advanced artificial intelligence algorithms to automate your cryptocurrency trading strategies
        </p>
      </div>

      <AIBotDashboard />
    </div>
  )
}
