
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ApiKeyManager } from "@/components/integrations/api-key-manager"
import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { TradingFeatures } from "@/components/integrations/trading-features"

'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useEffect } from 'react'


export default function IntegrationsPage() {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated — redirect or show login prompt')
    }
  }, [isAuthenticated])

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Integrations</h1>
      {/* TODO: добавить список интеграций */}
    </div>
  )
}
