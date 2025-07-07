import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, TrendingUp, Zap, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#30D5C8]/10 via-transparent to-purple-500/10" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20 hover:bg-[#30D5C8]/20">
            <Bot className="w-4 h-4 mr-2" />
            AI-Powered Trading Assistant
          </Badge>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Crypto Trading
            <br />
            <span className="bg-gradient-to-r from-[#30D5C8] to-blue-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get real-time crypto signals, automated DCA bots, and AI-driven market analysis delivered directly to your
            Telegram. Start trading smarter with CoinWayfinder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black font-semibold px-8 py-4 text-lg"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-[#30D5C8] mr-2" />
                <span className="text-2xl font-bold text-white">95%</span>
              </div>
              <p className="text-gray-400">Signal Accuracy</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-[#30D5C8] mr-2" />
                <span className="text-2xl font-bold text-white">24/7</span>
              </div>
              <p className="text-gray-400">Market Monitoring</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-[#30D5C8] mr-2" />
                <span className="text-2xl font-bold text-white">100K+</span>
              </div>
              <p className="text-gray-400">Active Users</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
