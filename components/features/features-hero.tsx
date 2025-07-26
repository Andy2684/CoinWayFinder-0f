"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, BarChart3, Shield, Zap, Globe, Smartphone } from "lucide-react"
import Link from "next/link"

export function FeaturesHero() {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
          🚀 Advanced Trading Platform
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Powerful Features for{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Professional Trading
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Discover the comprehensive suite of tools and features that make CoinWayFinder the ultimate cryptocurrency
          trading platform for both beginners and professionals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </Link>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Bot, label: "AI Trading Bots", color: "text-blue-400" },
            { icon: BarChart3, label: "Analytics", color: "text-purple-400" },
            { icon: Shield, label: "Security", color: "text-green-400" },
            { icon: Globe, label: "Multi-Exchange", color: "text-orange-400" },
            { icon: Zap, label: "Real-Time", color: "text-yellow-400" },
            { icon: Smartphone, label: "Mobile App", color: "text-cyan-400" },
          ].map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105">
                <feature.icon className={`h-8 w-8 ${feature.color} mx-auto mb-2`} />
                <p className="text-sm text-gray-300 font-medium">{feature.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
