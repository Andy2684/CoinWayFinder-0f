<<<<<<< HEAD
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApiKeyManager } from "@/components/integrations/api-key-manager"
import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { TradingFeatures } from "@/components/integrations/trading-features"

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Exchange Integrations</h1>
          <p className="text-gray-400">Connect and manage your cryptocurrency exchange accounts</p>
        </div>

        <IntegrationStatus />
        <ApiKeyManager />
        <ExchangeIntegrations />
        <TradingFeatures />
        <SecuritySettings />
      </div>
    </ProtectedRoute>
  )
}
=======
// TODO: исправленный код для app/integrations/page.tsx вставить сюда
// Пример: export function handler(req: Request): Response { return new Response("OK") }
>>>>>>> b2cd8b3 (fix: restore working state after local fixes)
