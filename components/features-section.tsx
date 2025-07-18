"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Bot, Shield, Zap, BarChart3, Bell, Globe, Lock, Smartphone } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI Trading Signals",
      description:
        "Advanced machine learning algorithms analyze market patterns to provide high-accuracy trading signals with 94% success rate.",
      badge: "AI Powered",
      color: "text-green-500",
    },
    {
      icon: Bot,
      title: "Automated Trading Bots",
      description:
        "Deploy sophisticated trading bots that execute trades 24/7, implementing your strategies even while you sleep.",
      badge: "Automated",
      color: "text-blue-500",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description:
        "Built-in risk controls including stop-loss, position sizing, and portfolio diversification to protect your capital.",
      badge: "Secure",
      color: "text-purple-500",
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description:
        "Comprehensive portfolio tracking with real-time P&L, performance metrics, and detailed trade history.",
      badge: "Analytics",
      color: "text-orange-500",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Customizable price alerts, signal notifications, and market event updates delivered instantly to your devices.",
      badge: "Real-time",
      color: "text-red-500",
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to major exchanges like Binance, Coinbase, and Kraken with secure API integration.",
      badge: "Connected",
      color: "text-cyan-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description:
        "Ultra-low latency trade execution ensures you never miss profitable opportunities in volatile markets.",
      badge: "Fast",
      color: "text-yellow-500",
    },
    {
      icon: Lock,
      title: "Bank-Grade Security",
      description: "Military-grade encryption, 2FA authentication, and cold storage integration keep your assets safe.",
      badge: "Protected",
      color: "text-indigo-500",
    },
    {
      icon: Smartphone,
      title: "Mobile Trading",
      description: "Full-featured mobile app lets you monitor positions, execute trades, and manage bots on the go.",
      badge: "Mobile",
      color: "text-pink-500",
    },
  ]

  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}
              Trade Like a Pro
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive suite of trading tools and AI-powered features gives you the edge you need to succeed in
            the crypto markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-background ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
