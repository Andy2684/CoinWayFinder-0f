"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExchangeIntegrations } from "@/components/integrations/exchange-integrations"
import { IntegrationStatus } from "@/components/integrations/integration-status"
import { SecuritySettings } from "@/components/integrations/security-settings"
import { TradingFeatures } from "@/components/integrations/trading-features"
import { APIKeyManager } from "@/components/integrations/api-key-manager"
import { PortfolioSync } from "@/components/integrations/portfolio-sync"
import { RealTimeFeeds } from "@/components/integrations/real-time-feeds"

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#191A1E] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔗 Exchange Integrations</h1>
          <p className="text-gray-300">Connect and manage your cryptocurrency exchange accounts</p>
        </div>

        <Tabs defaultValue="exchanges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border-gray-800">
            <TabsTrigger
              value="exchanges"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Exchanges
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              Status
            </TabsTrigger>
            <TabsTrigger
              value="api-keys"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="feeds" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              Live Feeds
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exchanges" className="space-y-6">
            <ExchangeIntegrations />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <IntegrationStatus />
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <APIKeyManager />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioSync />
          </TabsContent>

          <TabsContent value="feeds" className="space-y-6">
            <RealTimeFeeds />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
            <TradingFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
