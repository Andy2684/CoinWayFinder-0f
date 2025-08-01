"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface ExchangeConnectionStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

const EXCHANGES = [
  {
    id: "binance",
    name: "Binance",
    logo: "🟡",
    description: "World's largest crypto exchange",
    features: ["Spot Trading", "Futures", "Options", "Staking"],
    isPopular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Pro",
    logo: "🔵",
    description: "US-based regulated exchange",
    features: ["Spot Trading", "Advanced Charts", "API Access"],
    isPopular: true,
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🟣",
    description: "Secure and reliable trading",
    features: ["Spot Trading", "Margin Trading", "Futures"],
    isPopular: false,
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "🟠",
    description: "Derivatives trading platform",
    features: ["Futures", "Options", "Copy Trading"],
    isPopular: false,
  },
]

export function ExchangeConnectionStep({ data, onNext, isLoading }: ExchangeConnectionStepProps) {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(data?.exchanges?.connectedExchanges || [])

  const handleExchangeToggle = (exchangeId: string) => {
    setSelectedExchanges((prev) =>
      prev.includes(exchangeId) ? prev.filter((id) => id !== exchangeId) : [...prev, exchangeId],
    )
  }

  const handleNext = () => {
    onNext({
      exchanges: {
        connectedExchanges: selectedExchanges,
        apiKeys: selectedExchanges.map((exchange) => ({
          exchange,
          isConnected: false,
          permissions: [],
        })),
      },
    })
  }

  const handleSkip = () => {
    onNext({
      exchanges: {
        connectedExchanges: [],
        apiKeys: [],
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Connect Your Exchanges</h2>
        <p className="text-gray-300">Link your trading accounts to enable automated trading and portfolio tracking</p>
      </div>

      {/* Security Notice */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400 mb-1">Your Security is Our Priority</h3>
              <p className="text-sm text-blue-300">
                We use read-only API keys with restricted permissions. We never store your private keys or have access
                to withdraw funds from your accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Select Exchanges to Connect</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXCHANGES.map((exchange) => (
            <Card
              key={exchange.id}
              className={`cursor-pointer transition-all ${
                selectedExchanges.includes(exchange.id)
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
              }`}
              onClick={() => handleExchangeToggle(exchange.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{exchange.logo}</span>
                    <span>{exchange.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {exchange.isPopular && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Popular
                      </Badge>
                    )}
                    {selectedExchanges.includes(exchange.id) && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">{exchange.description}</p>
                <div className="flex flex-wrap gap-1">
                  {exchange.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs border-slate-500 text-slate-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Exchanges Info */}
      {selectedExchanges.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-400 mb-1">
                  {selectedExchanges.length} Exchange{selectedExchanges.length > 1 ? "s" : ""} Selected
                </h3>
                <p className="text-sm text-green-300">
                  You can set up API connections for these exchanges after completing onboarding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-400 mb-1">Optional Step</h3>
              <p className="text-sm text-yellow-300">
                You can skip this step and connect exchanges later from your dashboard. Manual trading and portfolio
                tracking will still be available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          Skip for Now
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
