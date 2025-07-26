import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 ring-1 ring-purple-500/20">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Trading Revolution
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Master Crypto Trading with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
            Unlock the power of automated trading with our advanced AI bots, real-time market analysis, and
            professional-grade tools. Join thousands of traders maximizing their crypto profits.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-400" />
              95% Success Rate
            </div>
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-400" />
              Bank-Grade Security
            </div>
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-purple-400" />
              Lightning Fast Execution
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/auth/signup">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 text-lg font-semibold bg-transparent"
            >
              <Link href="/features">Explore Features</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by 50,000+ traders worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">$2.5B+</div>
              <div className="text-sm text-gray-500">Trading Volume</div>
              <div className="text-2xl font-bold text-gray-400">99.9%</div>
              <div className="text-sm text-gray-500">Uptime</div>
              <div className="text-2xl font-bold text-gray-400">24/7</div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
