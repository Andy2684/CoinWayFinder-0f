"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Users,
  Clock,
  Target,
  Brain,
  Smartphone,
  Globe,
  Award,
  UserPlus,
  LogIn,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturesSection() {
  const { user } = useAuth()

  const mainFeatures = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Advanced machine learning algorithms that analyze market patterns and execute trades automatically 24/7.",
      features: ["Smart Risk Management", "Multi-Exchange Support", "Backtesting Tools", "Custom Strategies"],
      badge: "Most Popular",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive market analysis with live charts, technical indicators, and AI-powered insights.",
      features: ["Live Market Data", "Technical Analysis", "Price Alerts", "Portfolio Tracking"],
      badge: "Pro Feature",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with encrypted API connections and secure wallet integrations.",
      features: ["2FA Authentication", "API Key Encryption", "Secure Wallets", "Audit Logs"],
      badge: "Secure",
    },
  ]

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our optimized infrastructure",
    },
    {
      icon: Brain,
      title: "Smart AI",
      description: "Machine learning models trained on years of market data",
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Full-featured mobile app for trading on the go",
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to major cryptocurrency exchanges worldwide",
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      description: "Never miss an opportunity with round-the-clock automation",
    },
    {
      icon: Target,
      title: "Precision Trading",
      description: "Advanced algorithms for optimal entry and exit points",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-600/20 text-blue-400 border-blue-600/30">Advanced Features</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Dominate Crypto
            </span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Our comprehensive suite of tools and features gives you the edge you need to succeed in the fast-paced world
            of cryptocurrency trading.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                {!user && (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-105 transition-transform"
                  >
                    <Link href="/auth/signup">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-colors"
            >
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlight Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 md:p-12 backdrop-blur-lg border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">
                <Award className="h-3 w-3 mr-1" />
                Award Winning
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-4">Trusted by Professional Traders Worldwide</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our platform has been recognized by industry experts and is used by thousands of professional traders
                who rely on our advanced AI algorithms to maximize their profits.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-gray-400 text-sm">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">$50M+</div>
                  <div className="text-gray-400 text-sm">Daily Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">150+</div>
                  <div className="text-gray-400 text-sm">Countries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">Support</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Active Community</div>
                    <div className="text-gray-400 text-sm">Join 50,000+ active traders</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Proven Results</div>
                    <div className="text-gray-400 text-sm">94% average success rate</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Secure & Reliable</div>
                    <div className="text-gray-400 text-sm">Bank-grade security</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Experience These Features?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start your free trial today and see why thousands of traders choose CoinWayFinder for their cryptocurrency
              trading needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
