"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Shield, Clock, Activity } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/50 to-slate-900/50" />

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trade Smarter with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Crypto Bots
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and
            professional-grade risk management tools.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Start Trading Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
            >
              <Activity className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-400/30 px-4 py-2">
              <Shield className="mr-2 h-4 w-4" />
              Bank-Grade Security
            </Badge>
            <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-400/30 px-4 py-2">
              <TrendingUp className="mr-2 h-4 w-4" />
              95% Success Rate
            </Badge>
            <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-400/30 px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              24/7 Automated Trading
            </Badge>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">$2.5M+</div>
                <div className="text-gray-400">Total Volume Traded</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-gray-400">Active Traders</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Uptime Guarantee</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
