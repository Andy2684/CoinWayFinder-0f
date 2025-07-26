"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, CheckCircle, XCircle, AlertCircle, ExternalLink, Shield, TrendingUp, Globe, Zap } from "lucide-react"

interface Exchange {
  id: string
  name: string
  logo: string
  description: string
  status: "connected" | "disconnected" | "error" | "pending"
  region: string[]
  features: {
    spotTrading: boolean
    futuresTrading: boolean
    marginTrading: boolean
    staking: boolean
    lending: boolean
    nft: boolean
    p2p: boolean
    fiat: boolean
    options: boolean
    derivatives: boolean
  }
  fees: {
    maker: string
    taker: string
    withdrawal: string
  }
  supportedPairs: number
  volume24h: string
  established: string
  security: {
    rating: number
    features: string[]
  }
  apiLimits: {
    requests: string
    orders: string
    websocket: string
  }
  documentation: string
  testnet: boolean
  tier: "premium" | "standard" | "basic"
  specialFeatures: string[]
}

export function ExchangeIntegrations() {
  const [exchanges, setExchanges] = useState<Exchange[]>([
    {
      id: "binance",
      name: "Binance",
      logo: "🟡",
      description: "World's largest crypto exchange by trading volume",
      status: "connected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: true,
        p2p: true,
        fiat: true,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.1%", taker: "0.1%", withdrawal: "Variable" },
      supportedPairs: 1500,
      volume24h: "$15.2B",
      established: "2017",
      security: {
        rating: 9,
        features: ["2FA", "Whitelist", "Anti-phishing", "SAFU Fund", "Cold Storage"],
      },
      apiLimits: {
        requests: "1200/min",
        orders: "10/sec",
        websocket: "5 connections",
      },
      documentation: "https://binance-docs.github.io/apidocs/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["Launchpad", "Earn", "NFT Marketplace", "Futures", "Options"],
    },
    {
      id: "bybit",
      name: "Bybit",
      logo: "🟠",
      description: "Derivatives-focused exchange with high leverage",
      status: "connected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: false,
        p2p: true,
        fiat: true,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.1%", taker: "0.1%", withdrawal: "Variable" },
      supportedPairs: 600,
      volume24h: "$3.2B",
      established: "2018",
      security: {
        rating: 8,
        features: ["2FA", "Whitelist", "Anti-phishing", "Cold Storage", "Multi-sig"],
      },
      apiLimits: {
        requests: "120/min",
        orders: "10/sec",
        websocket: "10 connections",
      },
      documentation: "https://bybit-exchange.github.io/docs/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["Copy Trading", "Grid Trading", "DCA Bot", "Leveraged Tokens"],
    },
    {
      id: "coinbase",
      name: "Coinbase Pro",
      logo: "🔷",
      description: "Leading US-based cryptocurrency exchange",
      status: "connected",
      region: ["US", "EU", "UK", "Canada"],
      features: {
        spotTrading: true,
        futuresTrading: false,
        marginTrading: false,
        staking: true,
        lending: false,
        nft: true,
        p2p: false,
        fiat: true,
        options: false,
        derivatives: false,
      },
      fees: { maker: "0.5%", taker: "0.5%", withdrawal: "Variable" },
      supportedPairs: 200,
      volume24h: "$2.1B",
      established: "2012",
      security: {
        rating: 9,
        features: ["2FA", "Vault Storage", "Insurance", "Regulated", "FDIC Protected"],
      },
      apiLimits: {
        requests: "10000/hour",
        orders: "5/sec",
        websocket: "Unlimited",
      },
      documentation: "https://docs.cloud.coinbase.com/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["Institutional Grade", "Custody", "Prime Brokerage", "Earn Rewards"],
    },
    {
      id: "kraken",
      name: "Kraken",
      logo: "🟣",
      description: "Established exchange with strong security focus",
      status: "disconnected",
      region: ["US", "EU", "Canada", "Japan"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: false,
        nft: false,
        p2p: false,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.16%", taker: "0.26%", withdrawal: "Variable" },
      supportedPairs: 400,
      volume24h: "$800M",
      established: "2011",
      security: {
        rating: 9,
        features: ["2FA", "PGP/GPG", "Global Settings Lock", "Master Key", "Proof of Reserves"],
      },
      apiLimits: {
        requests: "15-20/sec",
        orders: "60/min",
        websocket: "Multiple",
      },
      documentation: "https://docs.kraken.com/rest/",
      testnet: false,
      tier: "premium",
      specialFeatures: ["Dark Pool", "OTC Trading", "Margin Trading", "Futures"],
    },
    {
      id: "okx",
      name: "OKX",
      logo: "⚫",
      description: "Global crypto exchange with comprehensive trading tools",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: true,
        p2p: true,
        fiat: true,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.08%", taker: "0.1%", withdrawal: "Variable" },
      supportedPairs: 800,
      volume24h: "$1.8B",
      established: "2017",
      security: {
        rating: 8,
        features: ["2FA", "Whitelist", "Anti-phishing", "Proof of Reserves", "Multi-sig"],
      },
      apiLimits: {
        requests: "20/2sec",
        orders: "60/2sec",
        websocket: "Multiple",
      },
      documentation: "https://www.okx.com/docs-v5/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["DEX", "Web3 Wallet", "DeFi", "Copy Trading", "Trading Bots"],
    },
    {
      id: "kucoin",
      name: "KuCoin",
      logo: "🟢",
      description: "People's exchange with extensive altcoin selection",
      status: "error",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: true,
        p2p: true,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.1%", taker: "0.1%", withdrawal: "Variable" },
      supportedPairs: 1200,
      volume24h: "$900M",
      established: "2017",
      security: {
        rating: 7,
        features: ["2FA", "Whitelist", "Anti-phishing", "Micro-withdrawal", "Cold Storage"],
      },
      apiLimits: {
        requests: "1800/min",
        orders: "45/3sec",
        websocket: "Multiple",
      },
      documentation: "https://docs.kucoin.com/",
      testnet: true,
      tier: "standard",
      specialFeatures: ["KCS Token", "Pool-X", "KuCoin Earn", "Trading Bot", "Margin"],
    },
    {
      id: "huobi",
      name: "Huobi Global",
      logo: "🔴",
      description: "Established exchange with global presence",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: false,
        p2p: true,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.2%", taker: "0.2%", withdrawal: "Variable" },
      supportedPairs: 700,
      volume24h: "$600M",
      established: "2013",
      security: {
        rating: 7,
        features: ["2FA", "Whitelist", "Anti-phishing", "Cold Storage", "Risk Control"],
      },
      apiLimits: {
        requests: "100/10sec",
        orders: "100/10sec",
        websocket: "Multiple",
      },
      documentation: "https://huobiapi.github.io/docs/",
      testnet: false,
      tier: "standard",
      specialFeatures: ["HT Token", "Huobi Earn", "Prime Pool", "C2C Trading"],
    },
    {
      id: "gate-io",
      name: "Gate.io",
      logo: "🟤",
      description: "Comprehensive trading platform with DeFi integration",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: true,
        p2p: true,
        fiat: true,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.2%", taker: "0.2%", withdrawal: "Variable" },
      supportedPairs: 1400,
      volume24h: "$500M",
      established: "2013",
      security: {
        rating: 7,
        features: ["2FA", "Whitelist", "Fund Password", "Cold Storage", "Multi-sig"],
      },
      apiLimits: {
        requests: "900/min",
        orders: "300/min",
        websocket: "Multiple",
      },
      documentation: "https://www.gate.io/docs/developers/",
      testnet: true,
      tier: "standard",
      specialFeatures: ["Startup IEO", "Hodl & Earn", "Copy Trading", "Quantitative"],
    },
    {
      id: "bitfinex",
      name: "Bitfinex",
      logo: "🟩",
      description: "Professional trading platform with advanced features",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: false,
        lending: true,
        nft: false,
        p2p: false,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.1%", taker: "0.2%", withdrawal: "Variable" },
      supportedPairs: 300,
      volume24h: "$400M",
      established: "2012",
      security: {
        rating: 6,
        features: ["2FA", "Whitelist", "Universal 2nd Factor", "PGP", "Cold Storage"],
      },
      apiLimits: {
        requests: "90/min",
        orders: "45/min",
        websocket: "Multiple",
      },
      documentation: "https://docs.bitfinex.com/docs/",
      testnet: false,
      tier: "standard",
      specialFeatures: ["Margin Funding", "Derivatives", "Paper Trading", "Advanced Orders"],
    },
    {
      id: "mexc",
      name: "MEXC Global",
      logo: "🔵",
      description: "High-performance digital asset trading platform",
      status: "disconnected",
      region: ["Global"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: false,
        nft: false,
        p2p: true,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.2%", taker: "0.2%", withdrawal: "Variable" },
      supportedPairs: 1600,
      volume24h: "$1.2B",
      established: "2018",
      security: {
        rating: 7,
        features: ["2FA", "Whitelist", "Anti-phishing", "Cold Storage", "Risk Management"],
      },
      apiLimits: {
        requests: "1200/min",
        orders: "20/sec",
        websocket: "Multiple",
      },
      documentation: "https://mxcdevelop.github.io/apidocs/",
      testnet: false,
      tier: "standard",
      specialFeatures: ["MX Token", "Launchpad", "Assessment", "Futures Grid"],
    },
    {
      id: "crypto-com",
      name: "Crypto.com Exchange",
      logo: "🔷",
      description: "Full-service crypto platform with card rewards",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: false,
        nft: true,
        p2p: false,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.4%", taker: "0.4%", withdrawal: "Variable" },
      supportedPairs: 250,
      volume24h: "$300M",
      established: "2019",
      security: {
        rating: 8,
        features: ["2FA", "Whitelist", "Multi-signature", "Cold Storage", "Insurance"],
      },
      apiLimits: {
        requests: "100/sec",
        orders: "15/sec",
        websocket: "Multiple",
      },
      documentation: "https://exchange-docs.crypto.com/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["CRO Token", "Visa Card", "DeFi Wallet", "Earn", "NFT Platform"],
    },
    {
      id: "ftx",
      name: "FTX",
      logo: "🔶",
      description: "Advanced derivatives and spot trading platform",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: true,
        nft: true,
        p2p: false,
        fiat: true,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.02%", taker: "0.07%", withdrawal: "Variable" },
      supportedPairs: 400,
      volume24h: "$1.5B",
      established: "2019",
      security: {
        rating: 8,
        features: ["2FA", "Whitelist", "Cold Storage", "Multi-sig", "Insurance"],
      },
      apiLimits: {
        requests: "30/sec",
        orders: "200/10sec",
        websocket: "Multiple",
      },
      documentation: "https://docs.ftx.com/",
      testnet: false,
      tier: "premium",
      specialFeatures: ["Tokenized Stocks", "Prediction Markets", "Leveraged Tokens", "Quant Zone"],
    },
    {
      id: "deribit",
      name: "Deribit",
      logo: "🟨",
      description: "Bitcoin and Ethereum options and futures exchange",
      status: "disconnected",
      region: ["Global"],
      features: {
        spotTrading: false,
        futuresTrading: true,
        marginTrading: true,
        staking: false,
        lending: false,
        nft: false,
        p2p: false,
        fiat: false,
        options: true,
        derivatives: true,
      },
      fees: { maker: "0.02%", taker: "0.05%", withdrawal: "Variable" },
      supportedPairs: 50,
      volume24h: "$800M",
      established: "2016",
      security: {
        rating: 8,
        features: ["2FA", "Cold Storage", "Multi-sig", "Segregated Accounts"],
      },
      apiLimits: {
        requests: "20/sec",
        orders: "50/sec",
        websocket: "Multiple",
      },
      documentation: "https://docs.deribit.com/",
      testnet: true,
      tier: "premium",
      specialFeatures: ["Options Trading", "Volatility Index", "Block Trading", "Portfolio Margin"],
    },
    {
      id: "bitget",
      name: "Bitget",
      logo: "🟡",
      description: "Copy trading and derivatives platform",
      status: "disconnected",
      region: ["Global", "Except US"],
      features: {
        spotTrading: true,
        futuresTrading: true,
        marginTrading: true,
        staking: true,
        lending: false,
        nft: false,
        p2p: true,
        fiat: true,
        options: false,
        derivatives: true,
      },
      fees: { maker: "0.1%", taker: "0.1%", withdrawal: "Variable" },
      supportedPairs: 500,
      volume24h: "$2.5B",
      established: "2018",
      security: {
        rating: 7,
        features: ["2FA", "Whitelist", "Cold Storage", "Protection Fund"],
      },
      apiLimits: {
        requests: "20/sec",
        orders: "10/sec",
        websocket: "Multiple",
      },
      documentation: "https://bitgetlimited.github.io/apidoc/",
      testnet: true,
      tier: "standard",
      specialFeatures: ["Copy Trading", "Grid Trading", "DCA", "One-Click Copy"],
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-400"
      case "error":
        return "bg-red-500/10 text-red-400"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
      case "standard":
        return "bg-blue-500/10 text-blue-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const toggleConnection = (exchangeId: string) => {
    setExchanges(
      exchanges.map((exchange) =>
        exchange.id === exchangeId
          ? { ...exchange, status: exchange.status === "connected" ? "disconnected" : "pending" }
          : exchange,
      ),
    )
  }

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Globe className="w-8 h-8 text-[#30D5C8]" />🏢 Supported Exchanges
        </h2>
        <p className="text-gray-300 text-lg">
          Connect to major cryptocurrency exchanges worldwide with advanced trading features
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge className="bg-green-500/10 text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            {exchanges.filter((e) => e.status === "connected").length} Connected
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-400">
            <TrendingUp className="w-3 h-3 mr-1" />
            {exchanges.filter((e) => e.tier === "premium").length} Premium Exchanges
          </Badge>
          <Badge className="bg-purple-500/10 text-purple-400">
            <Shield className="w-3 h-3 mr-1" />
            Advanced Security
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {exchanges.map((exchange) => (
          <Card
            key={exchange.id}
            className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#30D5C8]/10"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{exchange.logo}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white text-lg">{exchange.name}</CardTitle>
                      <Badge className={getTierColor(exchange.tier)} variant="outline">
                        {exchange.tier}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{exchange.description}</p>
                  </div>
                </div>
                {getStatusIcon(exchange.status)}
              </div>

              <div className="flex items-center justify-between mt-4">
                <Badge className={getStatusColor(exchange.status)}>
                  {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exchange.status === "connected"}
                    onCheckedChange={() => toggleConnection(exchange.id)}
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                  <p className="text-sm font-semibold text-white">{exchange.volume24h}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Trading Pairs</p>
                  <p className="text-sm font-semibold text-white">{exchange.supportedPairs.toLocaleString()}</p>
                </div>
              </div>

              {/* Fees */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Trading Fees</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">Maker</p>
                    <p className="text-sm text-white">{exchange.fees.maker}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <p className="text-xs text-gray-400">Taker</p>
                    <p className="text-sm text-white">{exchange.fees.taker}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Available Features</p>
                <div className="flex flex-wrap gap-1">
                  {exchange.features.spotTrading && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Spot
                    </Badge>
                  )}
                  {exchange.features.futuresTrading && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Futures
                    </Badge>
                  )}
                  {exchange.features.marginTrading && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Margin
                    </Badge>
                  )}
                  {exchange.features.options && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Options
                    </Badge>
                  )}
                  {exchange.features.staking && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Staking
                    </Badge>
                  )}
                  {exchange.features.fiat && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      Fiat
                    </Badge>
                  )}
                </div>
              </div>

              {/* Special Features */}
              {exchange.specialFeatures.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Special Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exchange.specialFeatures.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-[#30D5C8]/20 text-[#30D5C8]">
                        {feature}
                      </Badge>
                    ))}
                    {exchange.specialFeatures.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        +{exchange.specialFeatures.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Security Rating */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Security Rating
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < exchange.security.rating ? "bg-[#30D5C8]" : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-white">{exchange.security.rating}/10</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {exchange.testnet && (
                    <Badge variant="outline" className="text-xs border-[#30D5C8]/20 text-[#30D5C8]">
                      Testnet
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  className="flex-1 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold"
                  disabled={exchange.status === "connected"}
                >
                  {exchange.status === "connected" ? "Connected" : "Connect"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                  asChild
                >
                  <a href={exchange.documentation} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#30D5C8]">{exchanges.length}</div>
            <div className="text-sm text-gray-400">Total Exchanges</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {exchanges.filter((e) => e.status === "connected").length}
            </div>
            <div className="text-sm text-gray-400">Connected</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {exchanges.filter((e) => e.tier === "premium").length}
            </div>
            <div className="text-sm text-gray-400">Premium Tier</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {exchanges.reduce((sum, e) => sum + e.supportedPairs, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Pairs</div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
