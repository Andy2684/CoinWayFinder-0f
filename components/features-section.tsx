"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Signal, BarChart3, Shield, Zap, Globe, Award, UserPlus, LogIn, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function FeaturesSection() {
  const { user } = useAuth()

  const features = [
    {
      icon: Bot,
      title: "AI Trading Bots",
      description:
        "Deploy sophisticated AI-powered trading bots that execute strategies 24/7 with precision and speed.",
    },
    {
      icon: Signal,
      title: "Smart Signals",
      description: "Receive real-time trading signals based on advanced technical analysis and market sentiment.",
    },
    {
      icon: BarChart3,
      title: "Portfolio Analytics",
      description: "Track your performance with detailed analytics, risk metrics, and comprehensive reporting.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your funds and data are protected with bank-grade security and encryption protocols.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
    },
    {
      icon: Globe,
      title: "Multi-Exchange",
      description: "Connect to multiple exchanges and trade across different markets from a single platform.",
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
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 mb-6">{feature.description}</CardDescription>
                {feature.features && (
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
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
                  <Signal className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Smart Signals</div>
                    <div className="text-gray-400 text-sm">Receive real-time trading signals</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Portfolio Analytics</div>
                    <div className="text-gray-400 text-sm">Track your performance</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Multi-Exchange</div>
                    <div className="text-gray-400 text-sm">Trade across different markets</div>
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
