import { LiveNewsFeed } from "@/components/live-news-feed"
import { TrendingUp } from "lucide-react"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#30D5C8]/10 border border-[#30D5C8]/20 mb-6">
            <TrendingUp className="w-4 h-4 text-[#30D5C8] mr-2" />
            <span className="text-[#30D5C8] text-sm font-medium">Real-Time Market Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">📢 Live Market News</h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay ahead of the markets with AI-powered news analysis covering crypto, stocks, and global finance. Get
            instant insights and sentiment analysis to make informed trading decisions.
          </p>
        </div>

        {/* News Feed */}
        <LiveNewsFeed variant="full" />
      </div>
    </div>
  )
}
