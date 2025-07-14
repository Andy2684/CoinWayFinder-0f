import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { SignalFilters } from "@/components/signals/signal-filters"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SignalsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#191A1E]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
            <p className="text-gray-400 mt-2">AI-powered trading signals and market analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-1">
              <SignalFilters />
            </div>
            <div className="lg:col-span-2">
              <SignalFeed />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <SignalPerformance />
              <SignalAlerts />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
