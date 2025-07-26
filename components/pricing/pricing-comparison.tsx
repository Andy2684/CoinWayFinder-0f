"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Minus } from "lucide-react"

export function PricingComparison() {
  const features = [
    {
      category: "Trading Features",
      items: [
        { name: "Number of Trading Bots", starter: "1", pro: "5", enterprise: "Unlimited" },
        { name: "Trading Strategies", starter: "Basic (3)", pro: "Advanced (15+)", enterprise: "Custom + All" },
        { name: "Supported Exchanges", starter: "3", pro: "10+", enterprise: "All + Custom" },
        { name: "Order Types", starter: "Market, Limit", pro: "All Standard", enterprise: "All + Custom" },
        { name: "Portfolio Rebalancing", starter: false, pro: true, enterprise: true },
        { name: "Advanced Risk Management", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Analytics & Reporting",
      items: [
        { name: "Basic Analytics", starter: true, pro: true, enterprise: true },
        { name: "Advanced Portfolio Analytics", starter: false, pro: true, enterprise: true },
        { name: "Performance Reports", starter: "Basic", pro: "Detailed", enterprise: "Custom" },
        { name: "Backtesting", starter: false, pro: true, enterprise: true },
        { name: "Strategy Optimization", starter: false, pro: true, enterprise: true },
        { name: "Custom Dashboards", starter: false, pro: false, enterprise: true },
      ],
    },
    {
      category: "Support & Services",
      items: [
        { name: "Community Support", starter: true, pro: true, enterprise: true },
        { name: "Email Support", starter: "Standard", pro: "Priority", enterprise: "24/7" },
        { name: "Phone Support", starter: false, pro: false, enterprise: true },
        { name: "Dedicated Account Manager", starter: false, pro: false, enterprise: true },
        { name: "Custom Strategy Development", starter: false, pro: false, enterprise: true },
        { name: "White-label Solutions", starter: false, pro: false, enterprise: true },
      ],
    },
    {
      category: "Technical Features",
      items: [
        { name: "API Access", starter: false, pro: true, enterprise: true },
        { name: "Webhooks", starter: false, pro: true, enterprise: true },
        { name: "Custom Integrations", starter: false, pro: false, enterprise: true },
        { name: "Multi-user Access", starter: false, pro: false, enterprise: true },
        { name: "SSO Integration", starter: false, pro: false, enterprise: true },
        { name: "Advanced Security", starter: "Standard", pro: "Enhanced", enterprise: "Enterprise" },
      ],
    },
  ]

  const renderFeatureValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-400 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-500 mx-auto" />
      )
    }
    if (typeof value === "string") {
      return <span className="text-sm text-gray-300">{value}</span>
    }
    return <Minus className="h-5 w-5 text-gray-500 mx-auto" />
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Detailed Feature Comparison</h2>
          <p className="text-xl text-gray-300">Compare all features across our pricing plans</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="grid grid-cols-4 gap-4">
              <div></div>
              <div className="text-center">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Starter</Badge>
              </div>
              <div className="text-center">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Pro</Badge>
              </div>
              <div className="text-center">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Enterprise</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-4 gap-4 py-2 hover:bg-white/5 rounded-lg px-2">
                      <div className="text-gray-300 font-medium">{item.name}</div>
                      <div className="text-center">{renderFeatureValue(item.starter)}</div>
                      <div className="text-center">{renderFeatureValue(item.pro)}</div>
                      <div className="text-center">{renderFeatureValue(item.enterprise)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
