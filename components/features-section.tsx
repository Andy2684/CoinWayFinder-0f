"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Brain,
  Shield,
  Zap,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  Lock,
  Bell,
  Target,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Activity,
  PieChart,
} from "lucide-react"

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("trading")

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700",
        border: "border-blue-500/30",
      },
      purple: {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        button: "bg-purple-600 hover:bg-purple-700",
        border: "border-purple-500/30",
      },
      green: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        button: "bg-green-600 hover:bg-green-700",
        border: "border-green-500/30",
      },
      yellow: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        button: "bg-yellow-600 hover:bg-yellow-700",
        border: "border-yellow-500/30",
      },
      indigo: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        button: "bg-indigo-600 hover:bg-indigo-700",
        border: "border-indigo-500/30",
      },
      pink: {
        bg: "bg-pink-500/20",
        text: "text-pink-400",
        button: "bg-pink-600 hover:bg-pink-700",
        border: "border-pink-500/30",
      },
      cyan: {
        bg: "bg-cyan-500/20",
        text: "text-cyan-400",
        button: "bg-cyan-600 hover:bg-cyan-700",
        border: "border-cyan-500/30",
      },
      orange: {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        button: "bg-orange-600 hover:bg-orange-700",
        border: "border-orange-500/30",
      },
      teal: {
        bg: "bg-teal-500/20",
        text: "text-teal-400",
        button: "bg-teal-600 hover:bg-teal-700",
        border: "border-teal-500/30",
      },
      red: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        button: "bg-red-600 hover:bg-red-700",
        border: "border-red-500/30",
      },
      amber: {
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        button: "bg-amber-600 hover:bg-amber-700",
        border: "border-amber-500/30",
      },
      emerald: {
        bg: "bg-emerald-500/20",
        text: "text-emerald-400",
        button: "bg-emerald-600 hover:bg-emerald-700",
        border: "border-emerald-500/30",
      },
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const mainFeatures = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description: "Advanced algorithms that trade 24/7 with machine learning capabilities",
      benefits: ["24/7 Automated Trading", "Machine Learning", "Risk Management", "Backtesting"],
      color: "blue",
      category: "trading",
    },
    {
      icon: Brain,
      title: "Smart Analytics",
      description: "Real-time market analysis with predictive insights and trend detection",
      benefits: ["Predictive Analysis", "Market Trends", "Risk Assessment", "Performance Metrics"],
      color: "purple",
      category: "analytics",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and multi-layer security protocols",
      benefits: ["256-bit Encryption", "2FA Authentication", "Cold Storage", "Insurance Coverage"],
      color: "green",
      category: "security",
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Ultra-low latency trading with direct exchange connections",
      benefits: ["Sub-millisecond Execution", "Direct API Access", "High Frequency Trading", "Smart Routing"],
      color: "yellow",
      category: "trading",
    },
    {
      icon: BarChart3,
      title: "Advanced Portfolio Management",
      description: "Comprehensive portfolio tracking with rebalancing and optimization",
      benefits: ["Auto Rebalancing", "Diversification", "Tax Optimization", "Performance Tracking"],
      color: "indigo",
      category: "portfolio",
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "AI-powered market insights with sentiment analysis and news integration",
      benefits: ["Sentiment Analysis", "News Integration", "Social Signals", "Market Predictions"],
      color: "pink",
      category: "analytics",
    },
    {
      icon: Users,
      title: "Copy Trading",
      description: "Follow and copy successful traders with transparent performance metrics",
      benefits: ["Top Trader Rankings", "Performance History", "Risk Metrics", "Auto Copy"],
      color: "cyan",
      category: "social",
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connect to 50+ exchanges with unified portfolio management",
      benefits: ["50+ Exchanges", "Unified Interface", "Cross-Exchange Arbitrage", "Single Dashboard"],
      color: "orange",
      category: "trading",
    },
    {
      icon: Smartphone,
      title: "Mobile Trading",
      description: "Full-featured mobile app with push notifications and alerts",
      benefits: ["iOS & Android Apps", "Push Notifications", "Mobile Alerts", "Offline Access"],
      color: "teal",
      category: "mobile",
    },
    {
      icon: Lock,
      title: "Regulatory Compliance",
      description: "Fully compliant with global financial regulations and standards",
      benefits: ["KYC/AML Compliance", "Regulatory Reporting", "Audit Trails", "Legal Framework"],
      color: "red",
      category: "security",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Customizable alerts for price movements, portfolio changes, and opportunities",
      benefits: ["Price Alerts", "Portfolio Alerts", "News Alerts", "Custom Triggers"],
      color: "amber",
      category: "alerts",
    },
    {
      icon: Target,
      title: "Strategy Builder",
      description: "Visual strategy builder with backtesting and optimization tools",
      benefits: ["Drag & Drop Builder", "Backtesting Engine", "Strategy Optimization", "Paper Trading"],
      color: "emerald",
      category: "trading",
    },
  ]

  const categories = [
    { id: "trading", label: "Trading", icon: Bot },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "security", label: "Security", icon: Shield },
    { id: "portfolio", label: "Portfolio", icon: PieChart },
    { id: "social", label: "Social", icon: Users },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "alerts", label: "Alerts", icon: Bell },
  ]

  const filteredFeatures = mainFeatures.filter((feature) => feature.category === activeTab)

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
            <Star className="w-4 h-4 mr-2" />
            Premium Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Dominate the Markets
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in crypto trading.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-slate-800/50 border border-slate-700">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-blue-600"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    const colors = getColorClasses(feature.color)
                    return (
                      <Card
                        key={index}
                        className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 group cursor-pointer"
                      >
                        <CardHeader>
                          <div
                            className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                          >
                            <Icon className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                          <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-6">
                            {feature.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-center text-gray-300 text-sm">
                                <CheckCircle className={`w-4 h-4 ${colors.text} mr-2 flex-shrink-0`} />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${colors.border} ${colors.text} hover:${colors.bg} flex-1`}
                            >
                              Learn More
                            </Button>
                            <Button size="sm" className={`${colors.button} text-white`}>
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { icon: Activity, label: "Uptime", value: "99.9%", color: "green" },
            { icon: Zap, label: "Avg Response", value: "<50ms", color: "yellow" },
            { icon: Shield, label: "Security Score", value: "A+", color: "blue" },
            { icon: Users, label: "Active Users", value: "50K+", color: "purple" },
          ].map((stat, index) => {
            const Icon = stat.icon
            const colors = getColorClasses(stat.color)
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-6">Join thousands of traders already using our platform</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 bg-transparent"
            >
              Schedule Demo
              <Play className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 px-8">
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
