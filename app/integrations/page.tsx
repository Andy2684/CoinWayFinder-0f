import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { APIKeyManager } from "@/components/integrations/api-key-manager"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { TradingFeatures } from "@/components/integrations/trading-features"
import { SecuritySettings } from "@/components/integrations/security-settings"

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔗 Exchange Integrations</h1>
          <p className="text-gray-300">Connect your favorite crypto exchanges and trading platforms</p>
        </div>

        {/* Integration Status Overview */}
        <IntegrationStatus />

        {/* Exchange Integrations */}
        <ExchangeIntegrations />

        {/* API Key Manager */}
        <APIKeyManager />

        {/* Trading Features */}
        <TradingFeatures />

        {/* Security Settings */}
        <SecuritySettings />
      </div>
    </div>
  )
}
