"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, BarChart3, Shield, Zap, Globe } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trading Bots",
    description: "Deploy intelligent bots that trade 24/7 using advanced machine learning algorithms.",
    badge: "Popular",
  },
  {
    icon: TrendingUp,
    title: "Real-time Signals",
    description: "Get instant notifications for profitable trading opportunities across all major exchanges.",
    badge: "New",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Track your performance with detailed analytics and comprehensive reporting tools.",
    badge: null,
  },
  {
    icon: Shield,
    title: "Secure Trading",
    description: "Bank-grade security with encrypted connections and secure API key management.",
    badge: null,
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute trades in milliseconds with our optimized infrastructure and direct exchange connections.",
    badge: null,
  },
  {
    icon: Globe,
    title: "Multi-Exchange",
    description: "Connect to 20+ major cryptocurrency exchanges from a single unified platform.",
    badge: null,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to trade smarter
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Our comprehensive platform provides all the tools and features you need to succeed in cryptocurrency
            trading.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.badge && (
                      <Badge variant={feature.badge === "New" ? "default" : "secondary"}>{feature.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
