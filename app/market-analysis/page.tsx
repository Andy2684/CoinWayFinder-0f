import type { Metadata } from "next"
import { MarketAnalysis } from "@/components/market/market-analysis"
import { BackToDashboard } from "@/components/back-to-dashboard"

export const metadata: Metadata = {
  title: "Market Analysis | CoinWayFinder",
  description: "Real-time cryptocurrency market analysis with technical indicators and AI insights",
}

export default function MarketAnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BackToDashboard />
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Market Analysis</h1>
          <p className="text-muted-foreground">
            Real-time technical analysis, market sentiment, and AI-powered trading insights
          </p>
        </div>
      </div>

      <MarketAnalysis />
    </div>
  )
}
