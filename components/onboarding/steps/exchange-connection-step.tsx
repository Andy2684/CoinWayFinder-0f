"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link2, Shield, Info, Star, TrendingUp } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface ExchangeConnectionStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

export function ExchangeConnectionStep({ data, onNext, isLoading }: ExchangeConnectionStepProps) {
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(data?.exchanges?.connectedExchanges || [])

  const exchanges = [
    {
      id: "binance",
      name: "Binance",
      logo: "🟡",
      description: "World's largest crypto exchange",
      features: ["Spot Trading", "Futures", "Options", "Staking"],
      popular: true,
      volume: "$15B+ daily",
    },
    {
      id: "coinbase",
      name: "Coinbase Pro",
      logo: "🔵",
      description: "Leading US-based exchange",
      features: ["Spot Trading", "Advanced Charts", "Institutional"],
      popular: true,
      volume: "$3B+ daily",
    },
    {
      id: "kraken",
      name: "Kraken",
      logo: "🟣",
      description: "Secure and reliable trading",
      features: ["Spot Trading", "Margin", "Futures", "Staking"],
      popular: false,
      volume: "$1B+ daily",
    },
    {
      id: "bybit",
      name: "Bybit",
      logo: "🟠",
      description: "Derivatives trading specialist",
      features: ["Futures", "Options", "Copy Trading", "Spot"],
      popular: true,
      volume: "$8B+ daily",
    },
    {
      id: "kucoin",
      name: "KuCoin",
      logo: "🟢",
      description: "Altcoin trading hub",
      features: ["Spot Trading", "Futures", "Bot Trading", "Pool"],
      popular: false,
      volume: "$2B+ daily",
    },
    {
      id: "huobi",
      name: "Huobi",
      logo: "🔴",
      description: "Global crypto exchange",
      features: ["Spot Trading", "Derivatives", "DeFi", "NFT"],
      popular: false,
      volume: "$1.5B+ daily",
    },
  ]

  const handleSubmit = () => {
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

  const toggleExchange = (exchangeId: string) => {
    setSelectedExchanges((prev) =>
      prev.includes(exchangeId) ? prev.filter((id) => id !== exchangeId) : [...prev, exchangeId],
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Exchanges</h2>
        <p className="text-gray-300">Select the exchanges you'd like to connect for automated trading (optional)</p>
      </div>

      {/* Security Notice */}
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Your Security is Our Priority:</strong> We use read-only API keys and never store your exchange
          passwords. You can set up API connections later in your dashboard settings.
        </AlertDescription>
      </Alert>

      {/* Exchange Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Link2 className="w-5 h-5 mr-2" />
          Select Exchanges to Connect
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exchanges.map((exchange) => (
            <Card
              key={exchange.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedExchanges.includes(exchange.id)
                  ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50"
                  : "bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700/70"
              }`}
              onClick={() => toggleExchange(exchange.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{exchange.logo}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{exchange.name}</h4>
                        {exchange.popular && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{exchange.description}</p>
                    </div>
                  </div>
                  <Checkbox checked={selectedExchanges.includes(exchange.id)} onChange={() => {}} className="mt-1" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Daily Volume:</span>
                    <span className="text-sm font-medium text-white">{exchange.volume}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {exchange.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Exchanges Summary */}
      {selectedExchanges.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-400 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Selected Exchanges ({selectedExchanges.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedExchanges.map((exchangeId) => {
                const exchange = exchanges.find((e) => e.id === exchangeId)
                return (
                  <Badge key={exchangeId} className="bg-green-500/20 text-green-400 border-green-500/20">
                    {exchange?.logo} {exchange?.name}
                  </Badge>
                )
              })}
            </div>
            <p className="text-sm text-green-300 mt-2">
              You can set up API connections for these exchanges after completing onboarding.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-white">What happens next?</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• You'll be guided through secure API key setup in your dashboard</li>
                <li>• We'll help you configure read-only permissions for maximum security</li>
                <li>• Your trading bots will be able to execute trades on your behalf</li>
                <li>• You can disconnect exchanges at any time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => onNext({ exchanges: { connectedExchanges: [], apiKeys: [] } })}
          disabled={isLoading}
          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          Skip for Now
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving Selection..." : "Complete Setup"}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-400">
        Don't worry - you can always add or remove exchanges later in your settings
      </p>
    </div>
  )
}
