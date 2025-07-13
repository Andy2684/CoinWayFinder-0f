import { Button } from "@/components/ui/button"
import { ArrowRight, Bot } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#30D5C8]/10 border border-[#30D5C8]/20 mb-8">
            <Bot className="w-4 h-4 text-[#30D5C8] mr-2" />
            <span className="text-[#30D5C8] text-sm font-medium">AI-Powered Trading Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Smart AI-Powered
            <br />
            <span className="text-[#30D5C8]">Crypto Trading</span>
            <br />
            Assistant
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get real-time crypto signals, automated DCA bots, and AI-driven market analysis delivered directly to your
            Telegram. Start trading smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/pricing">
              <Button
                size="lg"
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold px-8 py-3 text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signals">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent"
              >
                See Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#30D5C8] mb-2">10K+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#30D5C8] mb-2">85%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#30D5C8] mb-2">24/7</div>
              <div className="text-gray-400">Market Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#30D5C8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#30D5C8]/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
