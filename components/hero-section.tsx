"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Trade Smarter with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Crypto Bots
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Automate your cryptocurrency trading with advanced AI algorithms, real-time market analysis, and
            professional-grade trading strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                  >
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-3 bg-transparent"
                  >
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">98.7%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">$2.5B+</div>
              <div className="text-gray-400">Volume Traded</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
