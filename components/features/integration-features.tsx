"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Zap, Link, Settings, CheckCircle, ExternalLink, Plus } from "lucide-react"

export function IntegrationFeatures() {
  const exchanges = [
    {
      name: "Binance",
      logo: "🟡",
      description: "World's largest crypto exchange",
      volume: "$15.2B",
      pairs: "1500+",
      features: ["Spot Trading", "Futures", "Margin", "Staking"],
      status: "active",
    },
    {
      name: "Coinbase Pro",
      logo: "🔷",
      description: "Leading US-based exchange",
      volume: "$2.1B",
      pairs: "200+",
      features: ["Spot Trading", "Staking", "Vault Storage"],
      status: "active",
    },
    {
      name: "Kraken",
      logo: "🟣",
      description: "Established with strong security",
      volume: "$800M",
      pairs: "400+",
      features: ["Spot Trading", "Futures", "Margin"],
      status: "active",
    },
    {
      name: "Bybit",
      logo: "🟠",
      description: "Derivatives-focused exchange",
      volume: "$3.2B",
      pairs: "600+",
      features: ["Futures", "Spot Trading", "Copy Trading"],
      status: "active",
    },
    {
      name: "OKX",
      logo: "⚫",
      description: "Global crypto exchange",
      volume: "$1.8B",
      pairs: "800+",
      features: ["Spot Trading", "Futures", "DeFi"],
      status: "active",
    },
    {
      name: "KuCoin",
      logo: "🟢",
      description: "People's exchange with altcoins",
      volume: "$900M",
      pairs: "1200+",
      features: ["Spot Trading", "Futures", "Pool-X"],
      status: "active",
    },
  ]

  const integrationFeatures = [
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to 15+ major cryptocurrency exchanges from a single platform",
      count: "15+",
    },
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Instant synchronization of balances, orders, and market data across all exchanges",
      count: "<1s",
    },
    {
      icon: Link,
      title: "Unified API",
      description: "Single API interface to manage trading across multiple exchanges seamlessly",
      count: "1 API",
    },
    {
      icon: Settings,
      title: "Custom Integrations",
      description: "Enterprise clients can request custom integrations for specific exchanges or protocols",
      count: "Custom",
    },
  ]

  const apiFeatures = [
    "RESTful API endpoints",
    "WebSocket real-time data",
    "Rate limit management",
    "Error handling & retry logic",
    "Comprehensive documentation",
    "SDK for popular languages",
    "Sandbox environment",
    "24/7 technical support",
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30">
            <Globe className="w-4 h-4 mr-2" />
            Exchange Integrations
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Connect to{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Major Exchanges
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Trade across multiple exchanges from one unified platform with seamless API integrations and real-time data
            synchronization
          </p>
        </div>

        {/* Integration Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {integrationFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-center"
            >
              <CardContent className="p-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 mb-4 mx-auto w-fit">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{feature.count}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Supported Exchanges */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Supported Exchanges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exchanges.map((exchange, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{exchange.logo}</div>
                      <div>
                        <CardTitle className="text-white text-lg">{exchange.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{exchange.description}</CardDescription>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                      <p className="text-sm font-semibold text-white">{exchange.volume}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Trading Pairs</p>
                      <p className="text-sm font-semibold text-white">{exchange.pairs}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-2">Available Features</p>
                    <div className="flex flex-wrap gap-1">
                      {exchange.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Exchange
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Features */}
        <div className="bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Powerful API Integration</h3>
              <p className="text-gray-300 mb-6">
                Our robust API infrastructure ensures reliable connections to all supported exchanges with advanced
                features for professional traders.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {apiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl mb-6">
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400 mb-4">API Uptime</div>
                <div className="text-2xl font-bold text-white mb-2">&lt;50ms</div>
                <div className="text-gray-400">Average Response Time</div>
              </div>
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                View API Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Add New Exchange */}
        <div className="text-center">
          <Card className="border-dashed border-2 border-gray-600 hover:border-orange-500/50 transition-colors bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Need Another Exchange?</h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Don't see your preferred exchange? Contact us to request a new integration.
              </p>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-white/10 bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Request Integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
