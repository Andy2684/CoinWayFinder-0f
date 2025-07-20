"use client"

import { useState } from "react"
import { toast } from "sonner"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { TradingFeatures } from "@/components/integrations/trading-features"
import { ApiKeyManager } from "@/components/integrations/api-key-manager"

interface Exchange {
  id: string
  name: string
  logo: string
  connected: boolean
  status: "active" | "error" | "pending"
  lastSync: string
  features: string[]
}

interface ApiKey {
  id: string
  exchange: string
  name: string
  permissions: string[]
  created: string
  lastUsed: string
  status: "active" | "inactive"
}

export default function IntegrationsPage() {
  const [exchanges] = useState<Exchange[]>([
    {
      id: "binance",
      name: "Binance",
      logo: "/placeholder.svg?height=40&width=40",
      connected: true,
      status: "active",
      lastSync: "2 minutes ago",
      features: ["Spot Trading", "Futures", "Options"],
    },
    {
      id: "coinbase",
      name: "Coinbase Pro",
      logo: "/placeholder.svg?height=40&width=40",
      connected: true,
      status: "active",
      lastSync: "5 minutes ago",
      features: ["Spot Trading", "Advanced Orders"],
    },
    {
      id: "kraken",
      name: "Kraken",
      logo: "/placeholder.svg?height=40&width=40",
      connected: false,
      status: "pending",
      lastSync: "Never",
      features: ["Spot Trading", "Futures", "Staking"],
    },
  ])

  const [apiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      exchange: "Binance",
      name: "Main Trading Key",
      permissions: ["Read", "Trade"],
      created: "2023-12-01",
      lastUsed: "2 minutes ago",
      status: "active",
    },
    {
      id: "2",
      exchange: "Coinbase Pro",
      name: "Portfolio Key",
      permissions: ["Read"],
      created: "2023-11-15",
      lastUsed: "1 hour ago",
      status: "active",
    },
  ])

  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})

  const handleConnect = (exchangeId: string) => {
    toast.success(`Connecting to ${exchangeId}...`)
  }

  const handleDisconnect = (exchangeId: string) => {
    toast.success(`Disconnected from ${exchangeId}`)
  }

  const handleTestConnection = (exchangeId: string) => {
    toast.info(`Testing connection to ${exchangeId}...`)
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Exchange Integrations</h1>
            <p className="text-gray-400">Connect your exchange accounts and manage API keys</p>
          </div>
          <BackToDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntegrationStatus />
          <SecuritySettings />
        </div>

        <ExchangeIntegrations />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApiKeyManager />
          <TradingFeatures />
        </div>
      </div>
    </div>
  )
}
