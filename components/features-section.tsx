"use client"

import { Bot, TrendingUp, Shield, Zap, BarChart3, Bell } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "AI Trading Signals",
      description:
        "Get real-time trading signals powered by advanced machine learning algorithms with 94% accuracy rate.",
    },
    {
      icon: <Bot className="h-8 w-8 text-blue-600" />,
      title: "Automated Bots",
      description:
        "Deploy intelligent trading bots that execute trades 24/7 based on your strategy and risk tolerance.",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Risk Management",
      description:
        "Advanced risk controls and stop-loss mechanisms to protect your investments from market volatility.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Portfolio Analytics",
      description: "Comprehensive portfolio tracking with detailed analytics and performance metrics.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our high-performance trading infrastructure.",
    },
    {
      icon: <Bell className="h-8 w-8 text-red-600" />,
      title: "Smart Alerts",
      description: "Get instant notifications for market opportunities and important portfolio changes.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Smart Trading</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to succeed in cryptocurrency trading, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
