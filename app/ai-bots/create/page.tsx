import type { Metadata } from "next"
import { AIBotCreator } from "@/components/ai-bots/ai-bot-creator"

export const metadata: Metadata = {
  title: "Create AI Bot | CoinWayFinder",
  description: "Create and configure advanced AI trading bots with machine learning",
}

export default function CreateAIBotPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AIBotCreator />
    </div>
  )
}
