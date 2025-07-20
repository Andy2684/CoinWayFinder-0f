"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Floating Icons */}
      <div className="absolute top-40 left-20 animate-bounce">
        <Bot className="w-8 h-8 text-blue-400 opacity-60" />
      </div>
      <div className="absolute top-60 right-32 animate-pulse">
        <TrendingUp className="w-6 h-6 text-green-400 opacity-60" />
      </div>
      <div className="absolute bottom-40 left-32 animate-bounce delay-1000">
        <Shield className="w-7 h-7 text-purple-400 opacity-60" />
      </div>
      <div className="absolute bottom-60 right-20 animate-pulse delay-500">
        <Zap className="w-5 h-5 text-yellow-400 opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          The Future of
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            Crypto Trading
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Harness the power of AI-driven trading bots, real-time market signals, and advanced analytics to maximize your
          cryptocurrency investments.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Start Trading Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-blue-400 mb-2">$2.5M+</div>
            <div className="text-gray-300">Total Volume Traded</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">94.7%</div>
            <div className="text-gray-300">Success Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
            <div className="text-gray-300">Active Traders</div>
          </div>
        </div>
      </div>
    </section>
  )
}
