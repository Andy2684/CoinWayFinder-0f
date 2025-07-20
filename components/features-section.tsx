"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell, ArrowRight, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

const features = [
  {
    icon: Bot,
    title: "AI Trading Bots",
    description:
      "Advanced algorithms that trade 24/7, analyzing market patterns and executing profitable trades automatically.",
    benefits: ["24/7 automated trading", "Advanced AI algorithms", "Customizable strategies"],
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Real-time market analysis with predictive insights to help you make informed trading decisions.",
    benefits: ["Real-time market data", "Predictive analytics", "Performance tracking"],
  },
  {
    icon: Shield,
    title: "Secure Trading",
    description: "Bank-level security with encrypted API connections and secure wallet integrations.",
    benefits: ["Bank-level encryption", "Secure API connections", "Multi-factor authentication"],
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure and direct exchange connections.",
    benefits: ["Millisecond execution", "Direct exchange APIs", "Low latency trading"],
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description: "Track your entire crypto portfolio with detailed analytics and performance metrics.",
    benefits: ["Portfolio tracking", "Performance analytics", "Risk management"],
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified of important market movements and trading opportunities in real-time.",
    benefits: ["Real-time alerts", "Custom notifications", "Market signals"],
  },
]

export function FeaturesSection() {
  const { user } = useAuth()

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Trade Smarter
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to succeed in cryptocurrency trading
            with AI-powered automation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link href={user ? "/dashboard" : "/auth/signup"}>
                  <Button
                    variant="ghost"
                    className="w-full text-blue-600 hover:bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature highlight section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Start Trading in Minutes</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect your exchange, configure your trading bot, and start earning profits with our simple 3-step setup
            process.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Connect Exchange</h4>
              <p className="text-blue-100">Securely connect your crypto exchange account</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Configure Bot</h4>
              <p className="text-blue-100">Set up your trading strategy and risk parameters</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Start Earning</h4>
              <p className="text-blue-100">Watch your bot trade automatically and generate profits</p>
            </div>
          </div>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 font-semibold rounded-xl bg-transparent"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
