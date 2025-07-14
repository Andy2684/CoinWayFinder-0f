import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { TradingFeatures } from "@/components/integrations/trading-features"
import { APIKeyManager } from "@/components/integrations/api-key-manager"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#191A1E]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Exchange Integrations</h1>
            <p className="text-gray-400 mt-2">Connect and manage your cryptocurrency exchange accounts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ExchangeIntegrations />
            </div>
            <div>
              <IntegrationStatus />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SecuritySettings />
            <TradingFeatures />
          </div>

          <APIKeyManager />
        </main>
      </div>
    </ProtectedRoute>
  )
}
