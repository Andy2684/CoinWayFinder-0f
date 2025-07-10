import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#30D5C8]/10 via-transparent to-transparent" />

      <div className="mx-auto max-w-7xl text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Bot className="h-8 w-8 text-[#30D5C8]" />
          <span className="text-2xl font-bold text-white">CoinWayFinder</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
          AI-Powered
          <span className="text-[#30D5C8] block">Crypto Trading</span>
          Made Simple
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-300">
          Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and
          professional-grade risk management. Start building wealth while you sleep.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/dashboard">
            <Button size="lg" className="bg-[#30D5C8] text-black hover:bg-[#30D5C8]/90 text-lg px-8 py-4">
              Start Trading Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/api-docs">
            <Button
              variant="outline"
              size="lg"
              className="border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/10 text-lg px-8 py-4 bg-transparent"
            >
              View API Docs
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8 lg:max-w-4xl lg:gap-16">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 text-3xl font-bold text-[#30D5C8]">
              <TrendingUp className="h-8 w-8" />
              <span>85%</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 text-3xl font-bold text-[#30D5C8]">
              <Bot className="h-8 w-8" />
              <span>24/7</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Automated Trading</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 text-3xl font-bold text-[#30D5C8]">
              <Shield className="h-8 w-8" />
              <span>100%</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Secure & Safe</div>
          </div>
        </div>
      </div>
    </section>
  )
}
